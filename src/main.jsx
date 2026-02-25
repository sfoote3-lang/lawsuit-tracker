import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import IssuePage from './pages/IssuePage'
import CasePage from './pages/CasePage'
import AllCasesPage from './pages/AllCasesPage'
import NewsPage from './pages/NewsPage'
import AboutPage from './pages/AboutPage'
import ClCasePage from './pages/ClCasePage'
import JudgePage from './pages/JudgePage'
import GeminiCasePage from './pages/GeminiCasePage'
import DictionaryPage from './pages/DictionaryPage'
import './App.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/issue/:slug',
    element: <IssuePage />,
  },
  {
    path: '/case/:caseId',
    element: <CasePage />,
  },
  {
    path: '/cases',
    element: <AllCasesPage />,
  },
  {
    path: '/news',
    element: <NewsPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    // Dynamic CourtListener-sourced case page — accessed via /docket?n=DOCKET_NUMBER
    path: '/docket',
    element: <ClCasePage />,
  },
  {
    path: '/judge/:jid',
    element: <JudgePage />,
  },
  {
    path: '/case/gemini-test',
    element: <GeminiCasePage />,
  },
  {
    path: '/dictionary',
    element: <DictionaryPage />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
