import { useEffect, useMemo, useState } from 'react';
import { List } from '../List/List';
import styles from './Panel.module.css';
import { Form } from '../Form/Form';
import { FilterButton } from '../FilterButton/FilterButton';
import { getCategoryInfo } from '../../utils/getCategoryInfo';
import { Info } from '../Info/Info';

export function Panel({ onError }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const url = 'http://localhost:3000/words';

  useEffect(() => {
    let isCanceled = false;
    const params = selectedCategory ? `?category=${selectedCategory}` : '';
    fetch(`${url}${params}`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Błąd ładowania danych!');
      })
      .then((res) => {
        if (!isCanceled) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch(onError);

    return () => {
      isCanceled = true;
    };
  }, [selectedCategory, onError]);

  const categoryInfo = useMemo(() => {
    getCategoryInfo(selectedCategory);
  }, [selectedCategory]);

  const handleFormSubmit = (formData) => {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!selectedCategory || selectedCategory === res.category) {
          setData((prevData) => [...prevData, res]);
          alert('Dodałeś słowo!');
        }
      });
  };

  const handleDeleteItem = (id) => {
    fetch(`${url}/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.ok) {
          setData((prevState) => prevState.filter((item) => item.id !== id));
          alert('Usunąłeś słowo!');
        } else {
          throw new Error('Błąd podczas usuwania!');
        }
      })
      .catch(onError);
  };

  const handleFilterClick = (category) => {
    setSelectedCategory(category);
  };

  if (isLoading) return <p>Ładowanie...</p>;

  return (
    <>
      <section className={styles.section}>
        <Info>{categoryInfo}</Info>
        <Form onFormSubmit={handleFormSubmit} />
        <div className={styles.filters}>
          <FilterButton
            active={selectedCategory === null}
            onClick={() => handleFilterClick(null)}
          >
            Wszystkie
          </FilterButton>
          <FilterButton
            active={selectedCategory === 'noun'}
            onClick={() => handleFilterClick('noun')}
          >
            Rzeczowniki
          </FilterButton>
          <FilterButton
            active={selectedCategory === 'verb'}
            onClick={() => handleFilterClick('verb')}
          >
            Czasowniki
          </FilterButton>
        </div>
        <List data={data} onDeleteItem={handleDeleteItem} />
      </section>
    </>
  );
}
