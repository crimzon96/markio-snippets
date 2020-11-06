import React, { FunctionComponent, } from 'react';

type Props = {
  fileUpload?: any;
  name: string;
  ariaLabel: string;
  type: string;
  CurrentImage: string;
  PreviewImage: any;
  label?: string;
};

const FileUpload: FunctionComponent<Props> = ({
  fileUpload,
  name,
  ariaLabel,
  type,
  CurrentImage,
  PreviewImage,
  label
}) => {
  const ShowImage = () => {
    if (PreviewImage) {
      const url = PreviewImage.url;
      return url;
    } else {
      return CurrentImage;
    }
  };


  return (
    <div className="card-body__file_upload card-body media align-items-center">
      <div className="image-cropper image-cropper__relative">
        { !CurrentImage === null ? null :
          <img
            src={ShowImage()}
            alt=""
            className="profile_image profile_image__full profile_image__dashboard"
          ></img>
        }
      </div>
      <div className="media-body ml-4">
        <div className="form-group form-group__file_upload">
          <input  accept=".jpg,.jpeg,.png" id="file"className="inputfile" onChange={fileUpload} type={type} name={name} aria-label={ariaLabel} ></input>
          <label className="label-style" htmlFor="file">Choose a image</label>
          <div  id="clear"style={{ margin: '0 0 0px 20px' }} className="btn btn-secondary btn-secondary__fileupload" onClick={fileUpload}>
            Clear
          </div>
        </div>
        <div className="text-light small mt-1">
          Allowed JPG, GIF or PNG. Max size of 800K
        </div>
      </div>
    </div>
  );
};
export default FileUpload;
