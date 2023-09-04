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
                    {!isLoading && !error && <MovieList movies={movies}/>}
                    {error && <ErrorMessage message={error}/>}
                </Box>
                <Box>
                    <WatchedSummary watched={watched}/>
                    <WatchedMoviesList watched={watched}/>
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

function MovieList({movies}) {
    return <ul className="list">
        {movies?.map((movie) => (
            <MovieItem movie={movie} key={movie.imdbID}/>
        ))}
    </ul>
}

function MovieItem({movie}) {
    return <li>
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
                <span>{avgImdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{avgUserRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{avgRuntime} min</span>
            </p>
        </div>
    </div>
}

function WatchedMoviesList({watched}) {
    return <ul className="list">
        {watched.map((movie) => (
            <WatchedMovie movie={movie} key={movie.imdbID}/>
        ))}
    </ul>
}

function WatchedMovie({movie}) {
    return <li key={movie.imdbID}>
        <img src={movie.Poster} alt={`${movie.Title} poster`}/>
        <h3>{movie.Title}</h3>
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