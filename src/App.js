import {useEffect, useState} from "react";
import StarRating from "./StarRating";

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = '2722a614'

export default function App() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    function handleSelectMovie(id) {
        id === selectedId ? setSelectedId(null) : setSelectedId(id);
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched(watched => [...watched, movie])
    }

    function handleDeleteWatched(id) {
        setWatched(watched => watched.filter(movie => movie.imdbID !== id))
    }

    useEffect(function () {
        async function fetchMovies() {
            try {
                setError('')
                setIsLoading(true)
                const res = await fetch(`http://www.omdbapi.com/?s=${query}&apikey=${KEY}`)
                if (!res.ok) throw new Error('Something went wrong with fetching movies')
                const movies = await res.json();
                if (movies.Response === 'False') throw new Error('Movie not found')
                setMovies(movies.Search)
                setIsLoading(false)
            } catch (err) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        if (!query.length) {
            setMovies([])
            setError('')
            return
        }
        fetchMovies()
    }, [query]);

    return (
        <>
            <NavBar>
                <Logo/>
                <Search query={query} setQuery={setQuery}/>
                <NumResults movies={movies}/>
            </NavBar>
            <Main>
                <Box>
                    {isLoading && !error && <Loader/>}
                    {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie}/>}
                    {error && <ErrorMessage message={error}/>}
                </Box>
                <Box>
                    {selectedId
                        ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie}
                                        onAddWatched={handleAddWatched} watched={watched}/>
                        : <><WatchedSummary watched={watched}/>
                            <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched}/></>}
                </Box>
            </Main>
        </>
    );
}

function Loader() {
    return <p className='loader'>Loading...</p>
}

function ErrorMessage({message}) {
    return <p className='error'>
        <span>🛑</span> {message}
    </p>
}

function NavBar({children}) {
    return <nav className="nav-bar">
        {children}
    </nav>
}

function Logo() {
    return <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
    </div>
}

function Search({query, setQuery}) {
    return <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
    />
}

function NumResults({movies}) {
    return <p className="num-results">
        Found <strong>{movies.length}</strong> results
    </p>
}

function Main({children}) {
    return <main className="main">
        {children}
    </main>
}

function Box({children}) {
    const [isOpen, setIsOpen] = useState(true);

    function handleOpen() {
        setIsOpen(open => !open)
    }

    return <div className="box">
        <Button isOpen={isOpen} onOpen={handleOpen}/>
        {isOpen && children}
    </div>
}

function MovieList({movies, onSelectMovie}) {
    return <ul className="list list-movies">
        {movies?.map((movie) => (
            <MovieItem movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
        ))}
    </ul>
}

function MovieItem({movie, onSelectMovie}) {
    return <li onClick={() => onSelectMovie(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`}/>
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>🗓</span>
                <span>{movie.Year}</span>
            </p>
        </div>
    </li>
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
    const [movie, setMovie] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [userRating, setUserRating] = useState('')
    const isWatched = watched.map(movie => movie.imdbID);
    const watchedMovieRating = watched.filter(movie => movie.imdbID === selectedId)[0]?.userRating

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre
    } = movie
    useEffect(() => {
            async function getMovieDetails() {
                setIsLoading(true)
                const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)
                const data = await res.json();
                setMovie(data)
                setIsLoading(false)
            }

            getMovieDetails()
        },
        [selectedId]);

    useEffect(() => {
        if (title) document.title = `Movie | ${title}`;
        return function() {
            document.title = 'usePopcorn'
        }
    }, [title]);

    function handleAdd() {
        const newWatchedMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: +imdbRating,
            runtime: +runtime.split(' ').at(0),
            userRating
        }
        onAddWatched(newWatchedMovie)
    }

    return <div className='details'>
        {isLoading ? <Loader/> : <>
            <header>
                <button className='btn-back' onClick={onCloseMovie}>
                    &larr;
                </button>
                <img src={poster} alt={`Poster of the ${movie}`}/>
                <div className="details-overview">
                    <h2>{title}</h2>
                    <p>{released} &bull; {runtime}</p>
                    <p>{genre}</p>
                    <p><span>⭐</span>{imdbRating}</p>
                </div>
            </header>
            <section>
                <div className="rating">
                    {isWatched.includes(selectedId) ? <p>You rated this movie with {watchedMovieRating}⭐</p> : <>
                        <StarRating size={24}
                                    onSetRating={setUserRating}/>
                        {userRating > 0 && <button className='btn-add' onClick={() => {
                            const watchedMovie = watched.filter(watchedMovie => watchedMovie.imdbID === selectedId);
                            if (watchedMovie.length !== 0) watchedMovie[0].userRating = userRating
                            else handleAdd(movie)
                            onCloseMovie()
                        }}>+ Add to list
                        </button>}</>}
                </div>
                <p><em>{plot}</em></p>
                <p>Starring {actors}</p>
                <p>Directed by {director}</p>
            </section>
        </>}

    </div>
}

function WatchedSummary({watched}) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return <div className="summary">
        <h2>Movies you watched</h2>
        <div>
            <p>
                <span>#️⃣</span>
                <span>{watched.length} movies</span>
            </p>
            <p>
                <span>⭐️</span>
                <span>{avgImdbRating.toFixed(1)}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{avgUserRating.toFixed(1)}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{avgRuntime} min</span>
            </p>
        </div>
    </div>
}

function WatchedMoviesList({watched, onDeleteWatched}) {
    return <ul className="list">
        {watched.map((movie) => (
            <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched}/>
        ))}
    </ul>
}

function WatchedMovie({movie, onDeleteWatched}) {
    return <li key={movie.imdbID}>
        <img src={movie.poster} alt={`${movie.title} poster`}/>
        <h3>{movie.title}</h3>
        <div>
            <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{movie.userRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
            </p>
            <button className='btn-delete' onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
        </div>
    </li>
}

function Button({isOpen, onOpen}) {
    return <button
        className="btn-toggle"
        onClick={onOpen}
    >
        {isOpen ? "–" : "+"}
    </button>
}