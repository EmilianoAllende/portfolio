import about from "@/../public/about.jpg";
import Image from "next/image";

export default function aboutPage() {
    return(
        <div className="mt-14 flex flex-col items-center text-tertiaryColor">
            <h1 className="bg-primaryColor text-7xl font-extrabold p-2 rounded-2xl">About Us</h1>

            <div className="mt-5">
                <Image src={about} alt="about.jpg" width={450} height={400} className="float-left m-4" style={{ maxHeight: "400px", objectFit: "contain" }}/>
                <div className="ml-3 p-3 h-fit bg-primaryColor rounded-3xl text-2xl">
                    <h2 className="mb-2 text-center font-bold">WHO WE ARE?</h2>
                        <p>At TechHome®, our passion for technology drives us. We believe that every device opens a door to new experiences, and from day one, we set out to bring the best of the electronic world into your daily life.</p>
                    <br/>
                    <h3>OUR STORY</h3>
                        <p>It all began with a dream: to create a space where innovation and people meet. Founded in 2010 by a group of tech enthusiasts, TechHome was born with the vision of making advanced technology accessible to all. We&apos;ve grown, but that spark that drives us to explore the unknown and share it with you remains intact.</p>
                    <br/>
                    <h3>OUR MISSION</h3>
                        <p>We aim to be more than just your favorite electronics store; we aspire to be your adventure companion on this digital journey. We are committed to offering you:</p>
                        <li>Innovative Products: A carefully curated selection of the latest in technology, so you&apos;re always one step ahead.</li>
                        <li>Personalized Experience: A passionate team ready to advise you and help find what you truly need.</li>
                        <li>Vibrant Community: A place where technology lovers can connect, learn, and grow together.</li>
                    <br/>
                    <h3>OUR VALUES</h3>
                        <li>Constant Innovation: We don&apos;t just follow trends; we create them and adapt them for you.</li>
                        <li>Quality Commitment: We work with leading brands to ensure you receive the best.</li>
                        <li>Exceptional Service: Your satisfaction is our priority, and we strive to exceed your expectations.</li>
                        <li>Sustainability: We believe in a future where technology and the environment coexist harmoniously. We promote responsible practices and eco-friendly products.</li>
                    <br/>
                    <h3>JOIN OUR TECH FAMILY</h3>
                        <p>At TechHome®, every customer is part of our family. We invite you to visit our stores, explore, ask questions, and above all, share your passion for electronics. Whether you&apos;re looking for the latest gadget, wanting to upgrade your smart space, or simply want to discover something new, we&apos;re here to accompany you.
                        <br/>
                        Welcome to the place where technology feels like home!</p>
                </div>
            </div>
        </div>
    );
};