import { useState, useContext, useEffect, useRef } from 'react';
import { Orbitron, Ubuntu } from 'next/font/google'
import { AiFillEdit, AiOutlineUnorderedList } from 'react-icons/ai'
import html2canvas from 'html2canvas';

const ubuntu = Ubuntu({ subsets: ['latin'], weight: "400" })
const orbitron = Orbitron({ subsets: ['latin'] })

const API_ENDPOINT = `https://www.omdbapi.com/?apikey=3f1ad88a`;
const missingPictureUrl =  'https://upload.wikimedia.org/wikipedia/commons/f/fc/No_picture_available.png'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [movies, setMovies] = useState([]);
  const [moviesList, setMoviesList] = useState([]);
  const [query, setQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const printRef = useRef();

  const [listName, setListName] = useState('My Top 10 Movies');
  const listNameInputField = useRef(null);
  const [listNameEditable, setListNameEditable] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);

  const fetchMovies = async (url) => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === 'True') {
        setMovies(data.Search);
        setIsError(false);
      } else {
        setIsError(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMovies(`${API_ENDPOINT}&s=${query}`);
  }, [query]);

  const handleAddObject = (newObject) => {

    const isDuplicate = moviesList.some(object => {
      return JSON.stringify(object) === JSON.stringify(newObject);
    });
  
    if (!isDuplicate && moviesList.length < 10) {
      setMoviesList([...moviesList, newObject]);
    }
  }

  const editButtonPressed = () => {
    setListNameEditable(!listNameEditable);
    
    setTimeout(() => {
      listNameInputField.current.focus();
    }, 500);
  }

  const handleDownloadImage = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {useCORS: true, scale: 2});

    const data = canvas.toDataURL('image/jpg');
    const link = document.createElement('a');

    if (typeof link.download === 'string') {
      link.href = data;
      link.download = 'image.jpg';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  const handleDeleteObject = (index) => {
    const newObjects = [...moviesList];
    newObjects.splice(index, 1);
    setMoviesList(newObjects);
  }
  
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
  }

  const handleDragOver = (e) => {
    e.preventDefault();
  }
  
  const handleDrop = (e, index) => {
    const newObjects = [...moviesList];
    const draggedObject = newObjects[draggedIndex];
    newObjects.splice(draggedIndex, 1);
    newObjects.splice(index, 0, draggedObject);
    setMoviesList(newObjects);
    setDraggedIndex(null);
  }


  return (
    <main
      className={`flex min-h-screen flex-col items-center p-12 ${ubuntu.className}`}
    >
      <h1 className={`self-start ${orbitron.className}`} style={{ letterSpacing: '2px' }}>
        Movies<span className={`font-bold`}>List</span>
      </h1>

      <div>
        <form className='search-form' onSubmit={(e) => e.preventDefault()}>
          <h2>search movies</h2>
          <input
            type='text'
            className='form-input'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <section className='movies'>
          {movies.map((movie) => {
            const { imdbID: id, Poster: poster, Title: title, Year: year } = movie

            return (
              <div key={id} className='movie'>
                <article>
                  <img src={poster === 'N/A' ? missingPictureUrl : poster} alt={title} />
                  <input 
                    type='button' 
                    className='addBtn' 
                    value='+'
                    onClick={() => handleAddObject(movie)}
                  />
                  <div className='movie-info'>
                    <h4 className='title'>{title}</h4>
                    <p>{year}</p>
                  </div>
                </article>
              </div>
            )
          })}
         </section>
      </div>
      <div className='instagram-story-image' ref={printRef}>
        <div className='listnamecontainer'>
          <h1 className={`${orbitron.className} `}>{listName}</h1>
        </div>
        <div className='entities-list'>
          {moviesList.map((movie, index) => {
              const { imdbID: id, Poster: poster, Title: title, Year: year } = movie
              return(
                <div key={id} className='instagram-story-image_entity'>
                <article>
                  <img src={poster === 'N/A' ? missingPictureUrl : poster} alt={title} />
                  <div className='instagram-story-image_entity-info'>
                    <h4 className='title'>{title} ({year})</h4>
                  </div>
                </article>
              </div>
              )
          })}
        </div>
        <h1 className={`${orbitron.className}`} style={{ letterSpacing: '2px' }}>
          Movies<span className={`font-bold`}>List</span>
        </h1>
      </div>
      <div className={showDrawer ? 'drawer show' : 'drawer'}>
          <div className='drawer-icon' onClick={() => setShowDrawer(!showDrawer)}>
            <AiOutlineUnorderedList size='20'/>
            <div className='drawer-icon-counter'>{moviesList.length}</div>
          </div>
        

        <div className='title-container'>
          <input 
            type='text' 
            value={listName} 
            className='list-name-title' 
            onChange={(event) => setListName(event.target.value)}
            disabled={!listNameEditable}
            ref={listNameInputField}
          />
          <button
            className='edit-list-name-enabler-button'
            onClick={editButtonPressed}
          >
            <AiFillEdit size='20'/>
          </button>
        </div>

        <div className='download-button-container'>
          <button disabled={!moviesList.length} className='download-button' type="button" onClick={handleDownloadImage}>
            Download for IG Story
          </button>
        </div>

        <div className='movies-list-container'>
          {moviesList.map((movie, index) => {
            const { imdbID: id, Poster: poster, Title: title, Year: year } = movie
            return(
              <div key={index} draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, index)}
              className='movies-list-entity'>              
              {index+1}. 
              <img src={poster === 'N/A' ? missingPictureUrl : poster} alt={title} />
              {title}             ({year})
              <button onClick={() => handleDeleteObject(index)} className='deletebtn'>X</button>            
              {/* {index > 0 && (
                <button onClick={() => handleMoveUp(index)}>Up</button>
              )}
              {index < moviesList.length - 1 && (
                <button onClick={() => handleMoveDown(index)}>Down</button>
              )} */}
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}
