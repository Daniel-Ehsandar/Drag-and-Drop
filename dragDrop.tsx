import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import callApi from "../../service/callApi";
import { useParams } from "react-router-dom";
import "./dragDrop.css";
import TEXT from "../../documents/icons2/text.svg";
import PictureGray from "../../documents/icons2/profile_gray.svg";
import PictureFrame from "../../documents/icons2/picture_frame.svg";
import EditGreen from "../../documents/icons2/edit_green.svg";
import TickImg from "../../documents/icons2/tick_circle.svg";
import ArrowDown from "../../documents/icons2/arrow_down_white.svg";
import Trash from "../../documents/icons2/trash_gray.svg";
import { Dropdown } from "react-bootstrap";
import Draggable from "react-draggable";
import ModalDragDrop from "./../../components/Modal/Modaldargdrop";
import { Editor } from "@tinymce/tinymce-react";

// Define the type of certItem
type CertItem = {
  uid: string;
  reg_token: string;
  title: string;
  end_desc: string;
  imageUrl?: string; //  for imageUrl
  imageUpload?: string; //  for imageUrl
};

function DragDrop() {
  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div
      className='btn btn-primary btn-block'
      ref={ref}
      onClick={(e) => {
        console.log("Toggle Clicked");
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
    </div>
  ));

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back one step in the history
  };

  const { uid } = useParams<{ uid: string }>();
  const [successMessageVisible, setSuccessMessageVisible] =
    useState<boolean>(false);
  const [certItem, setPostcertItem] = useState<CertItem | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fieldContent, setFieldContent] = useState<{ [key: string]: string }>(
    {},
  );
  // Remove this line if you are not using fieldContentImage
  const [certItem1, setCertItem1] = useState({
    // your initial state properties
    imageUpload: "",
    // other properties...
  });

  const [typingActivity, setTypingActivity] = useState<boolean>(true);

  useEffect(() => {
    callApi("cert", "item", { admin_tok: uid })
      .then((results: CertItem) => {
        setPostcertItem(results);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [uid]);

  const handleFieldClick = (fieldDescription: string) => {
    // Toggle selection of the clicked field
    setSelectedFields((prevSelectedFields) =>
      prevSelectedFields.includes(fieldDescription)
        ? prevSelectedFields.filter((field) => field !== fieldDescription)
        : [...prevSelectedFields, fieldDescription],
    );

    // If the field is not in fieldContent, set its content to the description
    if (!fieldContent[fieldDescription]) {
      setFieldContent((prevFieldContent) => ({
        ...prevFieldContent,
        [fieldDescription]: fieldDescription,
      }));
    }
    // Set typing activity to true when there is a typing event
    setTypingActivity(true);
  };

  const handleTrashClickimageUpload = () => {
    // Handle clearing or additional actions if needed
    // ...

    // Remove the entire Draggable section
    setPostcertItem((prevCertItem) => ({
      ...prevCertItem,
      imageUpload: "", // Clear the imageUpload property if needed
    }));

    // Set typing activity to false since the section is removed
    setTypingActivity(false);
  };

  const handleTrashClick = (fieldDescription: string) => {
    // Clear content of the clicked field
    setFieldContent((prevFieldContent) => ({
      ...prevFieldContent,
      [fieldDescription]: "",
    }));

    // Remove the clicked field from selectedFields
    setSelectedFields((prevSelectedFields) =>
      prevSelectedFields.filter((field) => field !== fieldDescription),
    );
    // Set typing activity to true when the trash bin is clicked
    setTypingActivity(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewImageUpload = reader.result as string;

        // Assuming you have a state variable to store the image URL, update it here
        setPostcertItem((prevCertItem) => ({
          ...prevCertItem!,
          imageUpload: previewImageUpload,
        }));
      };

      reader.readAsDataURL(imageFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;

        setPostcertItem((prevCertItem) => ({
          ...prevCertItem!,
          imageUrl: previewUrl,
        }));

        // Show success message
        setSuccessMessageVisible(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessageVisible(false);
        }, 10000);
      };

      reader.readAsDataURL(file);
    }
  };
  // const openFileInput = () => {
  //   const fileInput = document.getElementById("stillImageInput");
  //   if (fileInput) {
  //     fileInput.click();
  //   }
  // };

  // Rest of your component code...

  return (
    certItem && (
      <>
        <div className='container'>
          <div className=''>
            <div className='box-ctn-panel' style={{ minHeight: "100%" }}>
              <div className='px-5 mx-5'>
                <div style={{ padding: "16px 0px" }}>
                  <h5
                    style={{
                      color: "#2F4858",
                      display: "inline-block",
                      margin: "8px 0px",
                    }}
                  >
                    {certItem.title}
                  </h5>
                </div>
                <br />
                <br />
                <div className='row box-drag-drop'>
                  <div className='col-xxl-3 col-xl-3 col-lg-3 col-md-3 col-sm-2 col-xs-2 col-2 main-drop'>
                    <div className='drop-down'>
                      <Dropdown drop='down' align='end'>
                        <Dropdown.Toggle
                          variant='primary'
                          id='dropdown-basic'
                          as={CustomToggle}
                          size='lg'
                        >
                          انتخاب متغیر ها
                          <img
                            src={ArrowDown}
                            alt='Icon'
                            className='custom-arrow-down'
                          />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className='drop-down-menu'>
                          {certItem.fields
                            .filter(
                              (result) =>
                                result.description !==
                                "تصویر پرسنلی خود را ارسال کنید",
                            )
                            .map((result, index, array) => (
                              <Dropdown.Item
                                key={result.uid}
                                href=''
                                className='drop-down-menu-item'
                                onClick={() =>
                                  handleFieldClick(result.description)
                                }
                              >
                                {result.description}
                              </Dropdown.Item>
                            ))}
                          <Dropdown.Item
                            className='drop-down-menu-item'
                            style={{ color: "#2F4858" }}
                            onClick={() => handleFieldClick("افزودن متن")} // Adjust the field description accordingly
                          >
                            <>
                              <img
                                src={TEXT}
                                alt='Custom Image'
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  marginLeft: "8px",
                                }}
                              />
                              افزودن متن
                            </>
                          </Dropdown.Item>

                          {/* Additional item for "تصویر پرسنلی خود را ارسال کنید" */}
                          {certItem.fields
                            .filter(
                              (result) =>
                                result.description ===
                                "تصویر پرسنلی خود را ارسال کنید",
                            )
                            .map((result, index, array) => (
                              <Dropdown.Item
                                key={result.uid}
                                href=''
                                className='drop-down-menu-item'
                                style={{ color: "#2F4858" }}
                                onClick={() =>
                                  handleFieldClick(result.description)
                                }
                              >
                                {index === array.length - 1 ? (
                                  <>
                                    <img
                                      src={PictureFrame}
                                      alt='Custom Image'
                                      style={{
                                        width: "16px",
                                        height: "16px",
                                        marginLeft: "8px",
                                      }}
                                    />
                                    {/* Customize the text for the last item */}
                                    افزودن تصویر متغیر
                                    {/* Add an image next to the text */}
                                  </>
                                ) : (
                                  result.description
                                )}
                              </Dropdown.Item>
                            ))}
                          {/* custom text - custom img */}
                          {/* <Dropdown.Item
                            className='drop-down-menu-item'
                            style={{ border: "none", color: "#2F4858" }}
                            onClick={() => openFileInput()}
                          >
                            <div style={{ cursor: "pointer" }}>
                              <img
                                src={PictureFrame}
                                alt='Custom Image'
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  marginLeft: "8px",
                                }}
                              />
                              افزودن عکس ثابت
                            </div>
                          </Dropdown.Item> */}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor='fileInputImg'
                      // className='drop-down-menu-item'
                      style={{ border: "none", color: "#2F4858" }}
                    >
                      <img
                        src={PictureFrame}
                        alt='Custom Image'
                        style={{
                          width: "16px",
                          height: "16px",
                          marginLeft: "8px",
                        }}
                      />
                      افزودن عکس ثابت
                    </label>
                    <input
                      type='file' // Corrected from 'imageFile' to 'file'
                      id='fileInputImg'
                      name='avatar'
                      accept='image/png, image/jpeg, image/jpg'
                      style={{ display: "none" }}
                      onChange={(e) => handleImageChange(e)}
                    />
                  </div>

                  <div className='col-xxl-9 col-xl-9 col-lg-9 col-md-9 col-sm-9 col-xs-9 col-9 picture-editor'>
                    <label htmlFor='fileInput' style={{ cursor: "pointer" }}>
                      <img
                        src={EditGreen}
                        alt=''
                        style={{
                          marginLeft: "8px",
                          height: "24px",
                          width: "24px",
                        }}
                      />
                      تغییر تصویر گواهینامه
                    </label>
                    <input
                      type='file'
                      id='fileInput'
                      name='avatar'
                      accept='image/png, image/jpeg , image/jpg'
                      style={{ display: "none" }}
                      onChange={(e) => handleFileChange(e)}
                    />
                  </div>

                  {/* <div className='col-xxl-7 col-xl-6 col-lg-6 col-md-6 col-sm-7 col-xs-7 col-7 text-editor'>
                    ویرایشگر متن
                  </div> */}
                </div>
                <br />
                <div className='img-box' style={{ position: "relative" }}>
                  {/* Use the dynamic image source based on the user's file upload */}
                  <img
                    src={
                      certItem.imageUrl ||
                      `https://e-cert.ir/card/${certItem.reg_token}/template`
                    }
                    alt=''
                    style={{ width: "100%", padding: "0px 8px" }}
                  />
                  {certItem.imageUpload && (
                    <Draggable>
                      <div
                        className='clicked-field'
                        onFocus={() => setTypingActivity(true)}
                        onBlur={() =>
                          setTimeout(() => setTypingActivity(false), 1300)
                        }
                        style={{
                          animation: "fade-in 2s ease-in-out",
                        }}
                      >
                        <textarea
                          className='clicked-field-img'
                          style={{
                            width: "70%",
                            height: "auto",
                            resize: "both",
                            backgroundImage: `url(${certItem.imageUpload})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            contentEditable: true,
                            backgroundColor: "white",
                            backgroundPosition: "center",
                          }}
                          readOnly={true}
                          onInput={(e) => {
                            // Handle the input event if needed
                            // e.target.textContent contains the content
                          }}
                        />

                        {typingActivity && (
                          <div className='occupied-bin'>
                            <img
                              src={Trash}
                              alt=''
                              className='img-trash-field'
                              style={{
                                animation: "fade-in 2s ease-in-out",
                              }}
                              onClick={handleTrashClickimageUpload}
                            />
                          </div>
                        )}
                      </div>
                    </Draggable>
                  )}

                  {selectedFields.map((field, index) => {
                    if (field === "تصویر پرسنلی خود را ارسال کنید") {
                      return (
                        <Draggable key={index}>
                          <div
                            className='clicked-field'
                            onFocus={() => setTypingActivity(true)}
                            onBlur={() =>
                              setTimeout(() => setTypingActivity(false), 1000)
                            }
                          >
                            <textarea
                              className='clicked-field-img'
                              style={{
                                width: "70%",
                                height: "auto",
                                resize: "both",
                                backgroundImage: `url(${PictureGray})`,
                                backgroundSize: "contain",
                                backgroundRepeat: "no-repeat",
                                contentEditable: true,
                                backgroundColor: "white",
                                backgroundPosition: "center",
                              }}
                              readOnly={true}
                              onInput={(e) => {
                                // Handle the input event if needed
                                // e.target.textContent contains the content
                              }}
                            ></textarea>
                            {typingActivity && (
                              <div className='occupied-bin'>
                                <img
                                  src={Trash}
                                  alt=''
                                  className='img-trash-field'
                                  style={{
                                    animation: "fade-in 1s ease-in-out",
                                  }}
                                  onClick={() => handleTrashClick(field)}
                                />
                              </div>
                            )}
                          </div>
                        </Draggable>
                      );
                    } else {
                      // Handle other field types, you can add more conditions as needed
                      return (
                        <Draggable key={index}>
                          <div
                            className='clicked-field'
                            onFocus={() => setTypingActivity(true)}
                            onBlur={() =>
                              setTimeout(() => setTypingActivity(false), 1000)
                            }
                          >
                            <Editor
                              apiKey=''
                              initialValue={fieldContent[field]}
                              init={{
                                directionality: "rtl",
                                height: 800,
                                inline: true,
                                menubar: false,
                                inline_styles: true,
                                plugins: ["table"],
                                toolbar:
                                  "bold italic underline forecolor fontSize fontFamily alignleft aligncenter alignright alignfull",
                              }}
                              onEditorChange={(content) => {
                                setFieldContent((prevFieldContent) => ({
                                  ...prevFieldContent,
                                  [field]: content,
                                }));
                              }}
                            />

                            {typingActivity && (
                              <div className='occupied-bin'>
                                <img
                                  src={Trash}
                                  alt=''
                                  className='img-trash-field'
                                  style={{
                                    animation: "fade-in 1s ease-in-out",
                                  }}
                                  onClick={() => handleTrashClick(field)}
                                />
                              </div>
                            )}
                          </div>
                        </Draggable>
                      );
                    }
                  })}

                  {/* Display success message */}
                  {successMessageVisible && (
                    <div className='success-message '>
                      <img src={TickImg} className='img_icon-1' />

                      <span className=''>موفق</span>
                      <br />
                      <span className='text-span'>
                        تصویر با موفقیت بارگذاری شد
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <br />
            </div>
          </div>
          <br />
          <div className='row justify-content-end' style={{ margin: "0" }}>
            <div
              className='col-xxl-1 col-xl-1 col-lg-1 col-md-2 col-sm-2 col-xs-2 col-3 res-class'
              style={{ marginLeft: "14px" }}
            >
              <button
                className='btn btn-block btn-outline-primary'
                onClick={handleGoBack}
              >
                بازگشت
              </button>
            </div>

            <div className='col-xxl-1 col-xl-1 col-lg-1 col-md-2 col-sm-2 col-xs-2 col-3 res-class'>
              <div className='' style={{ marginRight: "10px", height: "100%" }}>
                <ModalDragDrop
                  cert_reg_token={certItem.reg_token}
                  cert_id={uid}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
}

export default DragDrop;
