import styled from "styled-components";

const Container = styled.div`
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  color: black;
  display: flex;
  flex-direction: column; 
  justify-content: center;      
  align-items: center;          
  margin: 0 auto;               
  background-color: #f9f9f9;
  border: solid 2px #ccc;
  border-radius: 10px;
  padding: 30px;
  width: 400px;
  gap: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.9);

  opacity: 0.9;
  position: absolute;
  top: 70%;                   
  left: 50%;                    
  transform: translate(-50%, -50%);
`;

const FormGroup = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box; 
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
`;

export { Container, FormGroup, Input, Button, ErrorMessage };
