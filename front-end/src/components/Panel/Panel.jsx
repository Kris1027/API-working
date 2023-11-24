import { useEffect, useState } from 'react';
import { List } from '../List/List';
import styles from './Panel.module.css';
import { Form } from '../Form/Form';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { FilterButton } from '../FilterButton/FilterButton';

export function Panel() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const url = 'http://localhost:3000/words';

  useEffect(() => {
    let isCanceled = false;
    const params = selectedCategory ? `?category=${selectedCategory}` : '';
    fetch(`${url}${params}`)
      .then((res) => res.json())
      .then((res) => {
        if (!isCanceled) {
          setData(res);
          setIsLoading(false);
        }
      });

    return () => {
      isCanceled = true;
    };
  }, [selectedCategory]);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      });
  }, []);

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
      .catch((e) => {
        setError(e.message);
        setTimeout(() => {
          setError(null);
        }, 3000);
      });
  };

  const handleFilterClick = (category) => {
    setSelectedCategory(category);
  };

  if (isLoading) return <p>Ładowanie...</p>;

  return (
    <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <section className={styles.section}>
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
