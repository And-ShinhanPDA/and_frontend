import CustomAlert from "@/components/modals/CustomAlert";
import React, { useState } from "react";

interface AlertConfig {
  title?: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
}

export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  const AlertComponent = () => {
    if (!alertConfig) return null;

    return (
      <CustomAlert
        visible={true}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    );
  };

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
}

