import { NavBar } from "antd-mobile";
import React, { useState } from 'react'
import { ImageUploader, Space} from 'antd-mobile'
//import { demoSrc,mockUploadFail } from './utils'
export default function Publish() {
const back = () => {
  window.history.back();
};
// const UploadStatus = () => {
//   const [fileList, setFileList] = useState([
//     {
//       url: demoSrc,
//     },
//   ]);

//   return (
//     <ImageUploader
//       value={fileList}
//       onChange={setFileList}
//       upload={mockUploadFail}
//     />
//   )
// }

  return (
    <div>
      <NavBar
          style={{
            '--height': '36px',
            '--border-bottom': '1px #eee solid',
            backgroundColor: '#FFFFFF',
          }}
          onBack={back}
        >
          发布游记
        </NavBar>
        {/* <Space direction='vertical'>
          <UploadStatus />
        </Space> */}
    </div>
  );
}