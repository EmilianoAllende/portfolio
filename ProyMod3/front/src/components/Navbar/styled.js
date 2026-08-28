import styled from "styled-components";

const Container = styled.div`
display:flex;
align-items: center;
padding: 10px;
width: 100%;
background: linear-gradient(#0098a7, #8e55dc);
height: fit-content;

h2{
  font-size: 35px;
  margin-left: 20px;
  justify-content: center;
}

img{
  width: 75px;
  height: 75px;
  justify-content: center;
  align-items: center;
}
`;

const ButtonContainer = styled.div`
display: flex;
width: 80%;
justify-content: flex-end;
align-items: center;
gap: 20px;

button {
  background-color: #012030;
  color: #ffbfbf;
  padding: 10px 20px;
  border: none;
  border-radius: 15px; 
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;

  &:hover {
    background-color: #888;
  }
}
`;

export { Container, ButtonContainer };
