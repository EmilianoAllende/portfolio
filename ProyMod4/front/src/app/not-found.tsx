import React from 'react';
import Image from 'next/image';
import RobImage from '@/../public/404.jpg';

const Error = () => {
    return (
        <>
        <div className="flex flex-col text-center mt-24 items-center content-center">
            <h1 className=" bg-secondaryColor text-tertiaryColor text-4xl" >PAGE NOT FOUND</h1>
            <Image src={RobImage} width={600} alt='not-found-img' className="rounded-xl border-primaryColor" />
        </div>
        </>

    );
};

export default Error;