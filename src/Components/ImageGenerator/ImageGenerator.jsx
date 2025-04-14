import React, { useRef, useState } from 'react'
import './ImageGenerator.css'
import default_Image from "../assets/default.jpg";

const ImageGenerator = () => {
  const [image_url, setImage_url] = useState("/")
  let inputRef = useRef(null);
  const [loading, setLoading] = useState(false)
  const [downloadAttempted, setDownloadAttempted] = useState(false)
  
  const key = import.meta.env.VITE_AI_API_KEY;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      imageGenerator();
    }
  }

  const imageGenerator = async () => {
    if (inputRef.current.value === "") {
      return 0;
    }
    setLoading(true)
    setDownloadAttempted(false)

    try {
      const response = await fetch("https://api.aimlapi.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
          "User-Agent": "Chrome",
        },
        body: JSON.stringify({
          prompt: `${inputRef.current.value}`,
          n: 1,
          size: "512x512",
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      let data = await response.json();
      let data_array = data.data;
      setImage_url(data_array[0].url);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = () => {
    if (image_url === "/") {
      return;
    }

    try {
      const link = document.createElement('a');
      link.target = "_blank";
      link.href = image_url;
      link.download = `AI-generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (!downloadAttempted) {
        setTimeout(() => {
          if (image_url.includes('blob.core.windows.net') ||
            image_url.includes('oaidalleapiprodscus') ||
            (new URL(image_url)).origin !== window.location.origin) {
            window.open(image_url, '_blank');
            setDownloadAttempted(true);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error initiating download:", error);
      if (!downloadAttempted) {
        window.open(image_url, '_blank');
        setDownloadAttempted(true);
      }
    }
  };

  return (
    <div className='ai-image-generator'>
      <div className="header">AI Image <span>Generator</span></div>
      <div className="img-loading">
        <div className="image"><img src={image_url === "/" ? default_Image : image_url} alt="" /></div>
        <div className="loading">
          <div className={loading ? "loading-bar-full" : "loading-bar"}></div>
          <div className={loading ? "loading-text" : "d-none"}>Loading...</div>
        </div>
        {image_url !== "/" && !loading && (
          <div className="download-btn" onClick={handleDownload}>
            {downloadAttempted ? "Open in New Tab" : "Download Image"}
          </div>
        )}
      </div>
      <div className="searchbox">
        <input type="text" ref={inputRef} placeholder="Describe what you want to generated" onKeyPress={handleKeyPress} className="search-input" />
        <div className="generate-btn" onClick={() => { imageGenerator() }}>Generate</div>
      </div>
    </div>
  )
}

export default ImageGenerator