import React, { useEffect } from 'react'
import HomePage from './GameComponents/HomePage'
import Orientation from 'react-native-orientation-locker';

const App = () => {
    useEffect(() => {
        Orientation.lockToLandscape()
    }, [])

    return (
        <HomePage />
    )
}

export default App