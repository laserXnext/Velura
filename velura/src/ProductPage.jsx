import React, { useState } from 'react';
import Product from './components/Product';
import Searchbar from './components/searchbar';
import Navbar from './components/Navbar';
import Filter from './components/filter';
import Footer from './components/Footer';
import ChatSystem from './components/ChatBot';

const ProductPage = () => {
    // State to track filters and search query
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});

    // Handle search from Searchbar component
    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    // Handle filter changes from Filter component
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="product-page">
            <Navbar />
            <div className="top-chat-wrapper">
                <ChatSystem position="top" />
            </div>
            <div className="product-page-content">
                <Searchbar onSearch={handleSearch} />
                <Filter onFilterChange={handleFilterChange} />
                <Product filters={filters} searchQuery={searchQuery} />
            </div>
            <Footer />
        </div>
    );
};

export default ProductPage;