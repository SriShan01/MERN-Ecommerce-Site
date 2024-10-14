import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice";
import styled from "styled-components";
import { BasicButton } from "../utils/buttonStyles";
import { getProductDetails, updateStuff } from "../redux/userHandle";
import {
  Avatar,
  Card,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { generateRandomColor, timeAgo } from "../utils/helperFunctions";
import { MoreVert } from "@mui/icons-material";
import Slide from "./Slide";
import { getSearchedProducts } from "../redux/userHandle";
import axios from "axios";
import { setFilteredProducts } from "../redux/userSlice";
import { useLocation, useNavigate } from "react-router-dom";

const REACT_APP_BASE_URL = "http://localhost:5000";

const ViewProduct = () => {
  const [productData, setProductData] = useState([]);
  const [loading2, setLoading2] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const params = useParams();
  const productID = params.id;

  const { currentUser, currentRole, productDetails, loading, responseDetails } =
    useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getProductDetails(productID));
  }, [productID, dispatch]);

  const [anchorElMenu, setAnchorElMenu] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorElMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorElMenu(null);
  };

  const deleteHandler = (reviewId) => {
    const fields = { reviewId };

    dispatch(updateStuff(fields, productID, "deleteProductReview"));
  };

  const reviewer = currentUser && currentUser._id;

  async function handleSearch(productDetails, setProductData, setLoading2) {
    const apiUrl = "/recommend";
    const requestData = {
      item_name: productDetails,
    };

    try {
      setLoading2(true);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      let dataRecommendations = data.recommendations;
      console.log("dataRecommendations", dataRecommendations);

      const result2Array = await Promise.all(
        dataRecommendations.slice(0, 5).map(async (item) => {
          const result2 = await axios.get(
            `${REACT_APP_BASE_URL}/searchProductRecommendation/${item}`
          );
          console.log("result2.data", result2.data);
          return result2.data;
        })
      );

      if (currentUser) {
        const response2 = await fetch("/get_most_selling_product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            age: parseInt(currentUser.age),
            gender: currentUser.gender,
            category: currentUser.category,
          }),
        });

        const mostSellingProducts = await response2.json();
        const mostSellingProductsCategory = mostSellingProducts.name;
        console.log("mostSellingProducts", mostSellingProductsCategory);

        const key = mostSellingProductsCategory;
        const additionalProducts = await axios.get(
          `${REACT_APP_BASE_URL}/searchProductRecommendationCategory/${key}`
        );
        console.log("result99.data", additionalProducts.data);
        if (additionalProducts.data.message) {
        } else {
          dispatch(setFilteredProducts(additionalProducts.data));

          const finalProductArray = [
            result2Array[0],
            result2Array[1],
            result2Array[2],
            ...additionalProducts.data,
          ];

          setProductData(finalProductArray);
          console.log("productData", finalProductArray);
        }
      } else {
        const finalProductArray = [...result2Array];
        setProductData(finalProductArray);
        console.log("productData", finalProductArray);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading2(false);
    }
  }

  useEffect(() => {
    if (productDetails && productDetails.productName) {
      const productDetails2 = productDetails.productName;
      handleSearch(productDetails2, setProductData, setLoading2);
    }
  }, [productDetails]);

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {responseDetails ? (
            <div>Product not found</div>
          ) : (
            <>
              <ProductContainer>
                <ProductImage
                  src={productDetails && productDetails.productImage}
                  alt={productDetails && productDetails.productName}
                />
                <ProductInfo>
                  <ProductName>
                    {productDetails && productDetails.productName}
                  </ProductName>
                  <PriceContainer>
                    <PriceCost>
                      ₹
                      {productDetails &&
                        productDetails.price &&
                        productDetails.mrp}
                    </PriceCost>
                    <PriceMrp>
                      ₹
                      {productDetails &&
                        productDetails.price &&
                        productDetails.price}
                    </PriceMrp>
                    <PriceDiscount>
                      {productDetails &&
                        productDetails.price &&
                        productDetails.mrp}
                      % off
                    </PriceDiscount>
                  </PriceContainer>
                  <Description>
                    {productDetails && productDetails.description}
                  </Description>
                  <ProductDetails>
                    <p>Category: {productDetails && productDetails.category}</p>
                    <p>
                      Subcategory:{" "}
                      {productDetails && productDetails.subcategory}
                    </p>
                  </ProductDetails>
                </ProductInfo>
              </ProductContainer>

              {currentRole === "Customer" && (
                <>
                  <ButtonContainer>
                    <BasicButton
                      onClick={() => dispatch(addToCart(productDetails))}
                    >
                      Add to Cart
                    </BasicButton>
                  </ButtonContainer>
                </>
              )}
              {/* <ReviewWritingContainer>
                <Typography variant="h4">Reviews</Typography>
              </ReviewWritingContainer>

              {productDetails.reviews && productDetails.reviews.length > 0 ? (
                <ReviewContainer>
                  {productDetails.reviews.map((review, index) => (
                    <ReviewCard key={index}>
                      <ReviewCardDivision>
                        <Avatar
                          sx={{
                            width: "60px",
                            height: "60px",
                            marginRight: "1rem",
                            backgroundColor: generateRandomColor(review._id),
                          }}
                        >
                          {String(review.reviewer.name).charAt(0)}
                        </Avatar>
                        <ReviewDetails>
                          <Typography variant="h6">
                            {review.reviewer.name}
                          </Typography>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "1rem",
                            }}
                          >
                            <Typography variant="body2">
                              {timeAgo(review.date)}
                            </Typography>
                          </div>
                          <Typography variant="subtitle1">
                            Rating: {review.rating}
                          </Typography>
                          <Typography variant="body1">
                            {review.comment}
                          </Typography>
                        </ReviewDetails>
                        {review.reviewer._id === reviewer && (
                          <>
                            <IconButton
                              onClick={handleOpenMenu}
                              sx={{ width: "4rem", color: "inherit", p: 0 }}
                            >
                              <MoreVert sx={{ fontSize: "2rem" }} />
                            </IconButton>
                            <Menu
                              id="menu-appbar"
                              anchorEl={anchorElMenu}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                              }}
                              keepMounted
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              open={Boolean(anchorElMenu)}
                              onClose={handleCloseMenu}
                              onClick={handleCloseMenu}
                            >
                              <MenuItem
                                onClick={() => {
                                  handleCloseMenu();
                                }}
                              >
                                <Typography textAlign="center">Edit</Typography>
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  deleteHandler(review._id);
                                  handleCloseMenu();
                                }}
                              >
                                <Typography textAlign="center">
                                  Delete
                                </Typography>
                              </MenuItem>
                            </Menu>
                          </>
                        )}
                      </ReviewCardDivision>
                    </ReviewCard>
                  ))}
                </ReviewContainer>
              ) : (
                <ReviewWritingContainer>
                  <Typography variant="h6">
                    No Reviews Found. Add a review.
                  </Typography>
                </ReviewWritingContainer>
              )} */}
            </>
          )}
        </>
      )}
      <Slide products={productData} title="Recommended Items" />
    </>
  );
};

export default ViewProduct;

const ProductContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px;
  justify-content: center;
  align-items: center;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ProductImage = styled.img`
  max-width: 300px;
  /* width: 50%; */
  margin-bottom: 20px;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h1`
  font-size: 24px;
`;

const PriceContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const PriceMrp = styled.p`
  margin-top: 8px;
  text-decoration: line-through;
  color: #525050;
`;

const PriceCost = styled.h3`
  margin-top: 8px;
`;

const PriceDiscount = styled.p`
  margin-top: 8px;
  color: darkgreen;
`;

const Description = styled.p`
  margin-top: 16px;
`;

const ProductDetails = styled.div`
  margin: 16px;
`;

const ButtonContainer = styled.div`
  margin: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ReviewWritingContainer = styled.div`
  margin: 6rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const ReviewContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const ReviewCard = styled(Card)`
  && {
    background-color: white;
    margin-bottom: 2rem;
    padding: 1rem;
  }
`;

const ReviewCardDivision = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const ReviewDetails = styled.div`
  flex: 1;
`;
