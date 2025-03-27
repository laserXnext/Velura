import React, { useState, useEffect } from "react";
import "../css/filter.css";

const Filter = ({ onFilterChange }) => {
    const [categories, setCategories] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [colors, setColors] = useState([]);
    const [priceRanges, setPriceRanges] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedPriceRange, setSelectedPriceRange] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    // Current timestamp and user for logging
    const currentDateTime = '2025-03-18 13:40:17';
    const currentUser = 'laserXnext';

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const fetchFilterOptions = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8082/api/sarees/filters');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Set materials from database
            setMaterials(data.materials || []);
            
            // Set colors from database
            setColors(data.colors || []);
            
            // Set categories from database
            setCategories(data.categories || []);
            
            // Create price ranges based on min and max prices
            if (data.priceStats) {
                const { minPrice, maxPrice } = data.priceStats;
                const ranges = [];
                
                if (minPrice < 5000) ranges.push("Below LKR 5000");
                if (minPrice <= 10000 && maxPrice >= 5000) ranges.push("LKR 5000 - LKR 10000");
                if (minPrice <= 20000 && maxPrice >= 10000) ranges.push("LKR 10000 - LKR 20000");
                if (maxPrice > 20000) ranges.push("Above LKR 20000");
                
                setPriceRanges(ranges);
            } else {
                // Default price ranges if no data
                setPriceRanges(["Below LKR 5000", "LKR 5000 - LKR 10000", "LKR 10000 - LKR 20000", "Above LKR 20000"]);
            }
            
            console.log(`[${currentDateTime}] ${currentUser}: Filter options loaded successfully`);
        } catch (error) {
            console.error(`[${currentDateTime}] ${currentUser}: Error fetching filter options:`, error);
            
            // Fallback to default values
            setMaterials(["Cotton", "Silk", "Georgette", "Chiffon"]);
            setColors(["Red", "Blue", "Green", "Yellow", "Black", "White"]);
            setCategories(["Traditional", "Wedding", "Casual", "Party Wear"]);
            setPriceRanges(["Below LKR 5000", "LKR 5000 - LKR 10000", "LKR 10000 - LKR 20000", "Above LKR 20000"]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (updatedFilters) => {
        onFilterChange(updatedFilters);
    };

    const handleReset = () => {
        setSelectedCategory("");
        setSelectedMaterial("");
        setSelectedPriceRange("");
        setSelectedColor("");
        handleFilterChange({});
    };

    return (
        <div className="filter-container">
            <select 
                value={selectedCategory} 
                onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    handleFilterChange({ 
                        category: e.target.value, 
                        material: selectedMaterial, 
                        priceRange: selectedPriceRange, 
                        color: selectedColor 
                    });
                }}
                disabled={loading}
            >
                <option value="">All Categories</option>
                {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            <select 
                value={selectedMaterial} 
                onChange={(e) => {
                    setSelectedMaterial(e.target.value);
                    handleFilterChange({ 
                        category: selectedCategory, 
                        material: e.target.value, 
                        priceRange: selectedPriceRange, 
                        color: selectedColor 
                    });
                }}
                disabled={loading}
            >
                <option value="">All Materials</option>
                {materials.map((mat, index) => (
                    <option key={index} value={mat}>
                        {mat}
                    </option>
                ))}
            </select>

            <select 
                value={selectedPriceRange} 
                onChange={(e) => {
                    setSelectedPriceRange(e.target.value);
                    handleFilterChange({ 
                        category: selectedCategory, 
                        material: selectedMaterial, 
                        priceRange: e.target.value, 
                        color: selectedColor 
                    });
                }}
                disabled={loading}
            >
                <option value="">All Prices</option>
                {priceRanges.map((range, index) => (
                    <option key={index} value={range}>
                        {range}
                    </option>
                ))}
            </select>

            <select 
                value={selectedColor} 
                onChange={(e) => {
                    setSelectedColor(e.target.value);
                    handleFilterChange({ 
                        category: selectedCategory, 
                        material: selectedMaterial, 
                        priceRange: selectedPriceRange, 
                        color: e.target.value 
                    });
                }}
                disabled={loading}
            >
                <option value="">All Colors</option>
                {colors.map((color, index) => (
                    <option key={index} value={color}>
                        {color}
                    </option>
                ))}
            </select>

            <button 
                onClick={handleReset}
                disabled={loading}
            >
                {loading ? <i className="fi fi-rr-spinner"></i> : <i className="fi fi-rr-refresh"></i>}
            </button>
            
            {loading && (
                <div className="filter-loading-overlay">
                    <div className="filter-loading">
                        <div className="loading-spinner"></div>
                        <span>Loading filters...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Filter;