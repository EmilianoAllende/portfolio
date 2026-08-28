import styled from "styled-components";

const Container = styled.div`
  color: black;
  justify-content: center;
  display: flex;
  flex-direction: column; 
  margin: auto;
  align-items: center;
  margin-top: 20px;
  background-image: url("https://t3.ftcdn.net/jpg/04/12/82/16/360_F_412821610_95RpjzPXCE2LiWGVShIUCGJSktkJQh6P.jpg");
  background-size: cover;
  border: solid;
  border-color: black;
  padding: 20px;  
  width: 300px;   
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 22px;  
    text-align: center;
    margin-bottom: 15px; 
    color: black;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 10px; 
    width: 100%;
  }

  label {
    font-size: 13px;  
    margin-bottom: 5px;
    display: inline-block;
    width: 100%;
  }

  input {
    width: 100%;  
    padding: 6px;   
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
  }

  button {
    margin-top: 8px;
    padding: 8px;   
    background-color: #000;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px; 
    transition: background-color 0.3s ease;
    width: 100%;
  }

  button:hover {
    background-color: #555;
  }

  .helper-text {
    font-size: 11px;   
    color: gray;
    text-align: right;
    margin-top: 8px;
  }

  .register-link {
    margin-top: 12px;  
    text-align: center;
    font-size: 13px;    }

  .register-link a {
    color: purple;
    text-decoration: none;
  }

  .register-link a:hover {
    text-decoration: underline;
  }
`;

export default Container;
