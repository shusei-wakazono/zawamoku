import React from "react";
import { PrimaryButton } from "./ui/PrimaryButton";
import { SecondaryButton } from "./ui/SecondaryButton";

type EndConfirmModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const EndConfirmModal: React.FC<EndConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#ffffff",
          borderRadius: "28px",
          padding: "28px 24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1e293b",
            margin: "0 0 10px 0",
            textAlign: "center",
          }}
        >
          作業を終了しますか？
        </h3>

        <p
          style={{
            fontSize: "13px",
            color: "#64748b",
            margin: "0 0 24px 0",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          タイマーを停止してリザルト画面へ移動します
        </p>

        {/* 終了するボタン (共通コンポーネント) */}
        <div style={{ width: "100%", marginBottom: "10px" }}>
          <PrimaryButton onClick={onConfirm} style={{ padding: "15px" }}>
            終了する
          </PrimaryButton>
        </div>

        {/* キャンセルボタン (共通コンポーネント) */}
        <div style={{ width: "100%" }}>
          <SecondaryButton onClick={onCancel}>キャンセル</SecondaryButton>
        </div>
      </div>
    </div>
  );
};
