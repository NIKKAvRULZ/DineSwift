import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const FadeInSection = ({ children, delay = 0, distance = '20px' }) => {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => setVisible(entry.isIntersecting));
        });
        
        const { current } = domRef;
        observer.observe(current);
        
        return () => observer.unobserve(current);
    }, []);

    return (
        <Box
            ref={domRef}
            sx={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible 
                    ? 'translateY(0)' 
                    : `translateY(${distance})`,
                transition: `all 0.6s ease-out ${delay}s`,
                height: '100%'
            }}
        >
            {children}
        </Box>
    );
};

export default FadeInSection;