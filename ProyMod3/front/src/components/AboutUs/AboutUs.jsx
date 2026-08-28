import { Container } from './styled';

const AboutUs = () => {
  return (
    <Container style={{ color: "black", width: "50%", margin: "auto" }}>
      <h1>Sobre Nosotros</h1>
      <p>
      Bienvenido a Elite Health, donde establecemos el máximo estándar en la medicina moderna. Nuestra clínica está comprometida a brindar atención médica de la más alta calidad, combinando tecnología de vanguardia con un enfoque compasivo que pone a nuestros pacientes en primer lugar. Lo que nos diferencia del resto es nuestra dedicación inquebrantable a la excelencia en cada aspecto de la atención.<br/>
      Contamos con un equipo de médicos especializados y experimentados en diversas áreas de la salud, utilizando tecnología de vanguardia para diagnósticos precisos y tratamientos efectivos. Nos enorgullecemos de ofrecer un ambiente cálido y acogedor, donde cada paciente recibe una atención completa y profesional.<br/>
      Invertimos continuamente en las últimas innovaciones médicas, lo que garantiza que nuestra clínica se mantenga a la vanguardia de la industria de la salud. Nuestras instalaciones de última generación, combinadas con nuestro compromiso con la investigación y la educación constante, nos permiten ofrecer soluciones innovadoras incluso para los problemas de salud más complejos.<br/>
      En Elite Health, tu bienestar es nuestra prioridad. Confía en nosotros para brindarte excelencia, compasión y resultados, porque cuando se trata de tu salud, solo lo mejor es suficiente.
      </p>

      <img 
        src='src\assets\doctors.png' 
        alt=''
        style={{ width: "100%" }}
      />
    </Container>
  );
};

export default AboutUs;
