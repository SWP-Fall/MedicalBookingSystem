import "./Blog.scss";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_URL from "~/api/Router";
import slider from "~/assets/images/slider.jpg";
import Pagination from "./Pagination";
import { hanlderRequest } from "~/utils";

function Blogs() {
  const listBlogRef = useRef();
  const [blogCategory, setBlogCategory] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [categoryName, setCategoryName] = useState('Tổng Hợp Các Bài Viết');

  useEffect(() => {
    fetchListCategoryBlogs();
    fetchBlogs();
  }, []);

  const fetchListCategoryBlogs = async () => {
    const [error, res] = await hanlderRequest(axios.get(API_URL + "/category"));
    if (res && res.data && res.data.category && res.data.category.length > 0) {
      setBlogCategory(res.data.category);
    } else {
      console.log(error.messsage);
    }
  };

  const fetchBlogs = async () => {
    const [error, res] = await hanlderRequest(axios.get(API_URL + "/blogs"));
    if (res && res.data && res.data.blogs && res.data.blogs.length > 0) {
      listBlogRef.current = res.data.blogs;
      setBlogs(res.data.blogs);
    } else {
      console.log(error);
    }
  };

  const handleFilterBlogByCategoryId = (category) => {
    let newBlogList = listBlogRef?.current?.filter(
      (blog) => blog.category_id === category._id
    );
    setBlogs(newBlogList);
    setCategoryName(category.name);
  };

  const hanldeGetAllBlogs = () => {
    setBlogs(listBlogRef.current);
  }

  return (
    <div className="Blog-wrapper">
      <div className="container blog-content">
        <div className="slider">
          <img src={slider} alt="slider" className="slider-body" />
        </div>
        <div className="row blog-body">
          <div className="major-list col-lg-3 col-xl-3">
            <ul className="list">
              <li className="item"> 
                <h5>Nội Dung</h5>
                <div className="line"></div>
              </li>
              {blogCategory.map((category, index) => {
                return (
                  <li className="item" key={index}>
                    <span
                      onClick={() => handleFilterBlogByCategoryId(category)}
                    >
                      {category.name}
                    </span>
                    <div className="line"></div>
                  </li>
                );
              })}
              <li 
                className="item"
                onClick={() => hanldeGetAllBlogs()}
              > 
                <span>Tất cả</span>
              </li>
            </ul>
          </div>
          <div className="blog-list col-lg-9 col-xl-9">
            <h1 className="type">{categoryName}</h1>
            <hr />
            <Pagination data={blogs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blogs;
