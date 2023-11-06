import React from 'react'
import { AppwriteProvider } from './LoginComponents/appwrite/AppwriteContext'
import { Router } from './LoginComponents/routes/Router'

const App = () => {
    return (
        <AppwriteProvider>
            <Router />
        </AppwriteProvider>
    )
}

export default App