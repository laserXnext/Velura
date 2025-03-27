import { useState } from "react";
import "../css/searchbar.css";

function Searchbar({ onSearch }) {
  const [search, setSearch] = useState("");
  const currentDateTime = "2025-03-18 13:58:55";
  const currentUser = "laserXnext";

  const handleSearch = () => {
    console.log(
      `[${currentDateTime}] ${currentUser}: Searching for "${search}"`
    );
    onSearch(search);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearch("");
    onSearch("");
  };

  return (
    <div className="search">
      <div className="search-input-container">
        <i className="uil uil-search search-icon" />
        <input
          type="text"
          placeholder="Search sarees by name, material, or color"
          className="searchbar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        {search && (
          <i className="uil uil-times clear-search" onClick={handleClear} />
        )}
      </div>
      <button
        type="button"
        className="search-btn"
        onClick={handleSearch}
        disabled={!search.trim()}
      >
        Search <i className="uil uil-search" />
      </button>
    </div>
  );
}

export default Searchbar;