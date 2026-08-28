import ColorManager from "./components/ColorManager";


const addColorPage = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-8">
        <ColorManager />
      </div>
    </div>
  );
};

export default addColorPage;
