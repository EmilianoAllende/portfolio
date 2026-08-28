import styled from "styled-components";

const Container = styled.div`
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 80%;

.active {
  background-color: #0d9c10;
  padding: 3px;
  
  :hover{
    opacity: 0.5;
  }
}

.canceled {
  background-color: red;
  padding: 3px;
  }
}

button {
  opacity: .85;
  background-color: #7030df; 
  color: white; 
  border: none; 
  padding: 10px 20px; 
  text-align: center; 
  text-decoration: none; 
  display: inline-block; 
  font-size: 16px; 
  margin: 4px 2px; 
  cursor: pointer; 
  border-radius: 4px; 
  transition: background-color 0.3s; 

  &:hover {
    background-color: #d32f2f; 
  }
}
`;

export { Container };
