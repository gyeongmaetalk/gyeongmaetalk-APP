import googleServiceInfo from "../google-services.json";

export const convertGoogleServiceInfoToFirebaseConfig = () => {
  return {
    appId: googleServiceInfo.client[0].client_info.mobilesdk_app_id,
    projectId: googleServiceInfo.project_info.project_id,
    messagingSenderId: googleServiceInfo.project_info.project_number,
    apiKey: "",
    databaseURL: "",
    storageBucket: "",
  };
};
