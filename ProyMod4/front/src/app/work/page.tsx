import okayRobot from "@/../public/work.jpg";
import Image from "next/image";

const workPage = () => {
    return(
        <div className="mt-14 flex flex-col items-center text-tertiaryColor">
            <h1 className="bg-primaryColor text-7xl font-extrabold p-2 rounded-2xl">Work With Us</h1>

            <div className="flex flex-row mt-5">
                <Image src={okayRobot} alt="work-robot" width={450} height={400}/>
                <div className="ml-3 p-3 h-fit bg-primaryColor rounded-3xl text-2xl">
                    <h3 className="mb-2 text-center">WHY WORK WITH US?</h3>
                    <p>At TechHome® , we believe that innovation and passion are the keys to creating high-quality electronic products that enhance people&apos;s lives. Here are a few reasons why working with us is an excellent decision:</p>
                        <li>Constant Innovation: We strive to be at the forefront of technology, developing products that change the way we live and work.</li>
                        <li>Supportive Culture: We offer an inclusive and collaborative work environment where every employee is valued and supported in their professional development.</li>
                        <li>Growth Opportunities: We have continuous training and development programs that allow you to grow within the company and advance in your career.</li>
                        <li>Diversity and Inclusion: We celebrate diversity and strive to create a workplace where everyone feels welcome and valued.</li>
                        <li>Global Impact: Our products reach customers all over the world, and working with us means contributing to a positive global impact.</li>
                        <p>JOIN US AN BE PART OF OUR TECHNOLOGICAL REVOLUTION.</p>
                </div>
            </div>
        </div>
    );
};

export default workPage;