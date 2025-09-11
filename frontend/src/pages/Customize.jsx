import React, { useContext, useRef, useState } from 'react'
import Card from '../components/Card'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { MdKeyboardBackspace } from "react-icons/md";

function Customize() {
  const {serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage}=useContext(userDataContext)
  const navigate=useNavigate()
     
  const inputImage=useRef()
      
  const handleImage=(e)=>{
    const file=e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  return (
    <div className='w-full h-[100vh] bg-slate-50 flex justify-center items-center flex-col p-[20px] '>
        <MdKeyboardBackspace className='absolute top-[30px] left-[30px] text-slate-600 cursor-pointer w-[25px] h-[25px]' onClick={()=>navigate("/")}/>
        <h1 className='text-slate-900 mb-[40px] text-[30px] text-center '>Select your <span className='text-blue-600'>Assistant Image</span></h1>
        <div className='w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]'>
      <Card image={image1}/>
       <Card image={image2}/>
        <Card image={image3}/>
         <Card image={image4}/>
          <Card image={image5}/>
           <Card image={image6}/>
            <Card image={image7}/>
     <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-white border-2 border-slate-300 rounded-2xl overflow-hidden hover:shadow-lg cursor-pointer hover:border-4 hover:border-slate-900 flex items-center justify-center ${selectedImage=="input"?"border-4 border-slate-900 shadow-lg ":null}` } onClick={()=>{
        inputImage.current.click()
        setSelectedImage("input")
     }}>
        {!frontendImage &&  <RiImageAddLine className='text-slate-600 w-[25px] h-[25px]'/>}
        {frontendImage && <img src={frontendImage} className='h-full object-cover'/>}
         </div>
    <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage}/>
      </div>
{selectedImage && <button className='min-w-[150px] h-[60px] mt-[30px] text-white font-semibold cursor-pointer bg-slate-900 rounded-full text-[19px] ' onClick={()=>navigate("/customize2")}>Next</button>}
           
    </div>
  )
}

export default Customize