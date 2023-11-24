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

  useEffect(() => {
    fetch('http://localhost:3000/words')
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      });
  }, []);

  const handleFormSubmit = (formData) => {
    fetch('http://localhost:3000/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((res) => {
        setData((prevData) => [...prevData, res]);
      });
  };

  const handleDeleteItem = (id) => {
    fetch(`http://localhost:3000/words/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.ok) {
          setData((prevState) => prevState.filter((item) => item.id !== id));
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
    const params = category ? `?category=${category}` : '';
    fetch(`http://localhost:3000/words${params}`)
      .then((res) => res.json())
      .then((res) => setData(res));
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
