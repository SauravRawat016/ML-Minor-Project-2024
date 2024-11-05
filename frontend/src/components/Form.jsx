import React, { useEffect, useState } from "react";
import axios from 'axios';

const Form = () => {
  const [formData, setFormData] = useState({
    url: "",
    reportType: "", // New state for the report type
  });
  const [error, setError] = useState("");
  const [result, setResult] = useState(""); // State to store the result
  const [isMalicious, setIsMalicious] = useState(false); // State to determine if URL is malicious
  const [urls, setUrls] = useState([]) ;

  useEffect(() => {
    axios.get('/melicious')
      .then((res) => setUrls(res.data))
      .catch((err) => console.log(err));
  }, []); // Added dependency array to avoid continuous API calls



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(""); // Clear error when user is typing
    setResult(""); // Clear result when user is typing
  };



  const isValidURL = (url) => {
    try {
      new URL(url); // Built-in URL constructor throws if URL is invalid
      return true;
    } catch (err) {
      return false;
    }
  };



  const checkIfMalicious = (url) => {
    console.log(urls);
    for(let i = 0; i < urls.length; i++){
      if(url === urls[i].link && urls[i].type != 'benign') return true;
    }
    
    return false;
  };

  const transform = (url) => {
    let ans = ""; 

    for (let i = 0; i < url.length; i++) {
        if (url[i] === '/') {
            ans += '=';  
        } else {
            ans += url[i];  
        }
    }
    return ans;  
}



  const handleCheck = (e) => {
    e.preventDefault();
    const url = formData.url;

    // Check if URL is malicious
    if (checkIfMalicious(url)) {
      setIsMalicious(true);
      for(let i = 0; i < urls.length; i++){
        if(url === urls[i].link ) setResult("This URL is " + urls[i].type);
      }
      
    }
    else {
      setIsMalicious(false);
      setResult("This URL is safe.");
      let test_url = transform(url) ;
      let req = "http://localhost:5001/predict/" + test_url;  
      fetch(req, {
          method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
          console.log(data);
          // Check the prediction in the response
          if (data.prediction !== "safe") {
              setIsMalicious(true);  // Set to true if the prediction is not "safe"
              setResult("This URL is " + data.prediction);  // Update the result with the prediction
          }
      })
      .catch(error => console.error('Error:', error));
    }

    setError('');
    console.log("Check URL:", url);
  };




  const handleReport = async (e) => {
    e.preventDefault();
    const url = formData.url;
    const reportType = formData.reportType; // Get report type from state

    // Validate URL
    if (!isValidURL(url)) {
      setError("Please enter a valid URL");
      return;
    }

    if (!reportType) {
      setError("Please select a report type");
      return;
    }

    try {
      console.log("Report URL:", url);
      // Send both URL and report type to backend
      const response = await axios.post('/report', {
        link: url,
        type: reportType // Send the report type to the backend
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Response:', response.data);
      setIsMalicious(true);
      setResult(`URL reported as ${reportType}`);
      
    } catch (error) {
      // Handle error
      console.error('Error:', error.response ? error.response.data : error.message);
      setError('Failed to report URL. Please try again.');
    }

    console.log("Reported URL:", formData.url);
  };




  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Enter a URL</h2>

        <div className="mb-4">
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Paste URL here"
            required
          />
          {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Report Type
          </label>
          <select
            name="reportType"
            value={formData.reportType}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Type</option>
            <option value="benign">Benign</option>
            <option value="malware">Malware</option>
            <option value="phishing">Phishing</option>
            <option value="defacement">Defacement</option>
          </select>
        </div>

        <div className="flex items-center justify-between space-x-4">
          <button
            onClick={handleCheck}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Check URL
          </button>
          <button
            onClick={handleReport}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Report URL
          </button>
        </div>

        {/* Display result if there is one */}
        {result && (
          <div
            className={`mt-4 p-4 border-l-4 ${
              isMalicious ? "bg-red-100 border-red-500" : "bg-green-100 border-green-500"
            }`}
          >
            <p className={`text-lg ${isMalicious ? "text-red-800" : "text-green-800"}`}>
              {result}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Form;
