import { ref, uploadBytesResumable } from "@firebase/storage";
import { getDownloadURL } from "firebase/storage";
import { NextPage } from "next";
import React, { useState } from "react";
import { storage } from "../utils/firebase";

const Upload: NextPage = () => {
  const [progress, setProgress] = useState(0);
  const handleUpload = async (e: any) => {
    e.preventDefault();
    const file = e.target[0].files[0];
    uploadFiles(file);
  };
  const uploadFiles = (file: any) => {
    if (!file) return;
    const sotrageRef = ref(storage, `files/${file.name}`);
    const uploadTask = uploadBytesResumable(sotrageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
        });
      }
    );
  };
  return (
    <div>
      <form onSubmit={handleUpload}>
        <input type="file" name="" id="" />
        <button type="submit">Upload</button>
        <p>{progress}</p>
      </form>
    </div>
  );
};

export default Upload;
