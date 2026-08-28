import styled, { css } from "styled-components";

const commonStyles = css`
  background-color: ${({ theme }) => theme.bgColor};
  color: ${({ theme }) => theme.color};
`;

const Box = styled.div`
  height: 80vh;
  ${commonStyles}

  button {
    ${commonStyles}
  }
`;

export { Box };
