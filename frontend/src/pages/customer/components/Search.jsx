import { InputBase, Box, styled } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { getSearchedProducts } from "../../../redux/userHandle";
import axios from "axios";
import { setFilteredProducts } from "../../../redux/userSlice";
const REACT_APP_BASE_URL = "http://localhost:5000";

const Search = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const handleSearch = () => {
    dispatch(getSearchedProducts("searchProduct", searchTerm));

    if (location.pathname !== "/ProductSearch") {
      navigate("/ProductSearch");
    }
  };

  // async function handleSearch(searchTerm) {
  //   const apiUrl = "/recommend";
  //   const requestData = {
  //     item_name: searchTerm,
  //   };

  //   try {
  //     const response = await fetch(apiUrl, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(requestData),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch recommendations");
  //     }

  //     const data = await response.json();
  //     console.log("Recommendations:", data.recommendations);
  //     let dataRecommendations = data.recommendations;

  //     const result2Array = await Promise.all(
  //       dataRecommendations.map(async (item) => {
  //         const result2 = await axios.get(
  //           `${REACT_APP_BASE_URL}/searchProduct/${item}`
  //         );
  //         console.log(".data", result2.data);
  //         return result2.data;
  //       })
  //     );

  //     console.log("result2Array", result2Array);

  //     dispatch(setFilteredProducts(result2Array));

  //     if (location.pathname !== "/ProductSearch") {
  //       navigate("/ProductSearch");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // }

  return (
    <SearchContainer>
      <InputSearchBase
        placeholder="Search for products, brands and more"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(searchTerm);
          }
        }}
      />
      <SearchIconWrapper>
        <SearchIcon sx={{ color: "#4d1c9c" }} />
      </SearchIconWrapper>
    </SearchContainer>
  );
};

const SearchContainer = styled(Box)`
  border-radius: 2px;
  margin-left: 10px;
  width: 38%;
  background-color: #fff;
  display: flex;
`;

const SearchIconWrapper = styled(Box)`
  margin-left: auto;
  padding: 5px;
  display: flex;
  color: blue;
`;

const InputSearchBase = styled(InputBase)`
  font-size: unset;
  width: 100%;
  padding-left: 20px;
`;

export default Search;
