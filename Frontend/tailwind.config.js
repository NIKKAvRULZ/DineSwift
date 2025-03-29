export default {
    content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors:{
          primary:"#FFC001",
          secondary:"FF9C01",
        },
        container:{
          center:true,
          padding:{
            default:"1rem",
            sm:"3rem",
          }
        }
      },
    },
    server: {
      hmr: {
        overlay: false, // Disable error overlay if needed
      },
    },    
    plugins: [],
  };
  
  