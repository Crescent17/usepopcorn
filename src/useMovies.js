import {useEffect, useState} from "react";

const KEY = '2722a614'

export function useMovies(query, callback) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(function () {
        const controller = new AbortController()

        async function fetchMovies() {
            try {
                setError('')
                setIsLoading(true)
                const res = await fetch(`http://www.omdbapi.com/?s=${query}&apikey=${KEY}`, {signal: controller.signal})
                if (!res.ok) throw new Error('Something went wrong with fetching movies')
                const movies = await res.json();
                if (movies.Response === 'False') throw new Error('Movie not found')
                setMovies(movies.Search)
                setError('')
                setIsLoading(false)
            } catch (err) {
                if (err.name !== 'AbortError') setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        if (!query.length) {
            setMovies([])
            setError('')
            return
        }
        callback()
        fetchMovies();
        return function () {
            controller.abort()
        }
    }, [query]);
    return {movies, isLoading, error}
}