import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import _ from "lodash";
import { useRef, useContext } from "react";
import { faCircleMinus, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

import { hanlderRequest } from "~/utils";
import API_URL from "~/api/Router";
import { v4 as uuidv4 } from "uuid";
import "./ModalEditServices.scss";
import { cloneData } from "~/utils";
import { DoctorContext } from "~/context/DoctorContext";


function EditServices(props) {
  // const { fetchSchedule } = props;
  const context = useContext(DoctorContext);
  const [listServices, setListServices] = useState([]);
  const [userServices, setUserServices] = useState([]);
  const userServicesRef = useRef();
  const serviceQty = useRef();
  const listServiesRef = useRef();

  useEffect(() => {
    const cloneUserBooked = cloneData(context.user);
    if (!_.isEmpty(cloneUserBooked)) {
      setUserServices(cloneUserBooked.services);
    }
  }, [context.user]);

  useEffect(() => {
    fetchAllServices();
  }, []);

  // validate select duplicate service
  const validateDuplicateService = (id) => {
    const cloneUserServices = cloneData(userServices);
    for (const service of cloneUserServices) {
      if (service.service_id === id) {
        listServiesRef.current.className = "form-select is-invalid";
        return true;
      } else {
        listServiesRef.current.className = "form-select";
      }
    }
  };

  const hanldeOnChangeQuantity = (event, id) => {
    const cloneUserServices = cloneData(userServices);
    if (!_.isEmpty(cloneUserServices)) {
      const service = cloneUserServices.find((item) => item.service_id === id);
      service.quantity = +event.target.value;
      // if (service.quantity < 0 || service.quantity > 32) {
      //   serviceQty.current.className = "form-control is-invalid";
      //   return;
      // }else {
      //   serviceQty.current.className = "form-control";
      // }
    }
    setUserServices(cloneUserServices);
  };

  const hanldeOnchangeService = (event, id) => {
    const cloneUserServices = cloneData(userServices);
    // find service only match the unique_id
    const extraService = cloneUserServices.find((item) => {
      return item.unique_id === id;
    });
    // if (extraService === cloneUserServices[0]) return;
    if (validateDuplicateService(event.target.value)) {
      extraService.service_id = "";
      setUserServices(cloneUserServices);
      return;
    }
    extraService.service_id = event.target.value;
    console.log(">>> check userServices: ", userServices);
    // select duplicate service
    setUserServices(cloneUserServices);
  };

  const fetchAllServices = async () => {
    const [error, res] = await hanlderRequest(axios.get(API_URL + "/services"));
    if (res && res.data) {
      setListServices(res.data);
    } else {
      console.log(`%c ${error.message}`, "color: red");
    }
  };

  const handleUpdateServices = async (bookedUser) => {
    let error, res;
    // update quantity
    for (const service of userServices) {
      [error, res] = await hanlderRequest(
        axios.put(
          API_URL + `/bookedservices/${bookedUser._id}/${service.service_id}`,
          { quantity: `${service.quantity}` }
        )
      );
    }

    // update add extra service
    for (const extraService of userServices) {
      if (extraService.unique_id) {
        console.log(">> extra service: ", extraService);
        if (extraService.quantity === "" || extraService.service_id === "") {
          toast.error("chưa điền dịch vụ mới thêm");
          return;
        } else {
          console.log("_> will update user services: ", userServices);
          [error, res] = await hanlderRequest(
            axios.put(API_URL + `/bookedservices/${bookedUser._id}`, {
              service_id: `${extraService.service_id}`,
              quantity: `${extraService.quantity}`,
            })
          );
        }
      }
    }

    if (res && res.data) {
      toast.success("cập nhật thành công");
      resetAdditionServices();
      // await fetchSchedule();
    } else {
      toast.error(error.message);
    }
  };

  const hanldeAddExtraService = () => {
    const newEmptyServices = {
      unique_id: uuidv4(),
      service_id: "",
      quantity: "",
    };
    setUserServices([...userServices, newEmptyServices]);
  };

  const handleDeleteExtraService = (id) => {
    const newUserServices = userServices.filter(
      (item) => item.unique_id !== id
    );
    if (newUserServices) {
      setUserServices(newUserServices);
    }
  };

  const resetAdditionServices = () => {
    const removedEmptyValue = userServices.filter(
      (service) => !service.unique_id
    );
    setUserServices(removedEmptyValue);
  };

  return (  
      <>
        {userServices?.map((service, index) => {
          return (
            <div className="row addition-services py-1" key={index}>
              <div className="col-md-7">
                <label htmlFor="inputCity" className="form-label">
                  {`Dịch Vụ - ${index + 1}`}
                </label>
                <select
                  id="inputState"
                  className="form-select"
                  value={service.service_id}
                  onChange={(event) =>
                    hanldeOnchangeService(event, service.unique_id)
                  }
                  name="select-service"
                  ref={listServiesRef}
                >
                  <option>--- Thêm dịch vụ ---</option>
                  {listServices &&
                    listServices.length > 0 &&
                    listServices.map((item, index) => {
                      return (
                        <React.Fragment key={index}>
                          <option value={item._id}>{`${item.name}`}</option>
                        </React.Fragment>
                      );
                    })}
                </select>
                <span className="invalid-feedback mt-2">
                  dịch vụ này đã được chọn
                </span>
              </div>
              <div className="col-md-3">
                <label htmlFor="inputQnt" className="form-label testcss">
                  Số lượng
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="inputQnt"
                  value={service.quantity}
                  placeholder="1-32"
                  name="quantity"
                  onChange={(event) =>
                    hanldeOnChangeQuantity(event, service.service_id)
                  }
                  min="1"
                  ref={serviceQty}
                  max="32"
                />
                <span className="invalid-feedback mt-2">không hợp lệ</span>
              </div>
              <div className="col-md-1 plus-service">
                {service.unique_id && (
                  <span
                    className="note-icon"
                    onClick={() => handleDeleteExtraService(service.unique_id)}
                  >
                    <FontAwesomeIcon
                      icon={faCircleMinus}
                      style={{ fontSize: "22px" }}
                    />
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div className="footerSchedule">
          <button className="cancle-btn"
            onClick={() => resetAdditionServices()}
          >
            Hủy
          </button>
          <Button
            className="ml-3"
            onClick={() => handleUpdateServices(context.user)}
          >
            Cập Nhật
          </Button>
        </div>

        {Object.keys(context.user).length > 0 ? (
          <span style={{}} className="row faCirclePlus-icon">
            {userServices?.length >= 7 ? (
              ""
            ) : (
              <span
                className="add-extra-icon"
                onClick={hanldeAddExtraService}
              >
                <FontAwesomeIcon
                  icon={faCirclePlus}
                  style={{ fontSize: "24px" }}
                />
              </span>
            )}
          </span>
        ) : (
          ""
        )}
      </>
  );
}

export default EditServices;
