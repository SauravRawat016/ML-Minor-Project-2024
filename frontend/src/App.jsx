import { useState } from 'react'
import Form from './components/Form.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  
  return (
    <>
      <h1 className="text-6xl font-extrabold text-gray-800 ">
      Project Melicious
      </h1>
      <Form/>
    </>
  )
}

export default App
