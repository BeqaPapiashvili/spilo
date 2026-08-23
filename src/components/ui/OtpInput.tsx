"use client";

import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function OtpInput({
  length = 6,
  value = "",
  onChange,
  hasError = false,
  autoFocus = true,
  disabled = false,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split current value into array of length
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value;
    const cleanDigits = inputValue.replace(/\D/g, "");

    if (!cleanDigits) {
      // Cleared the input
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    if (cleanDigits.length > 1) {
      // Multiple digits entered (e.g., from autofill / copy-paste directly inside input)
      const combined = (
        value.slice(0, index) +
        cleanDigits +
        value.slice(index + 1)
      )
        .replace(/\D/g, "")
        .slice(0, length);

      onChange(combined);
      const nextFocusIndex = Math.min(combined.length, length - 1);
      inputsRef.current[nextFocusIndex]?.focus();
      return;
    }

    // Single digit entered
    const lastChar = cleanDigits[cleanDigits.length - 1];
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const newValue = newDigits.join("");
    onChange(newValue);

    // Auto advance focus to next empty box or next box
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Current is empty, backspace moves to previous and clears it
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputsRef.current[index - 1]?.focus();
      } else if (digits[index]) {
        // Clear current
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const cleanNumbers = pastedData.replace(/\D/g, "").slice(0, length);
    if (cleanNumbers) {
      onChange(cleanNumbers);
      const targetIndex = Math.min(cleanNumbers.length, length - 1);
      inputsRef.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 w-full select-none" data-otp-container>
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        return (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[index]}
            disabled={disabled}
            autoComplete="one-time-code"
            name={`verification-code-digit-${index}`}
            id={`verification-code-digit-${index}`}
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            spellCheck="false"
            autoCorrect="off"
            autoCapitalize="off"
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`w-full aspect-square max-w-[56px] min-h-[48px] sm:min-h-[52px] rounded-2xl text-center text-lg sm:text-xl font-mono text-gray-900 transition-all duration-200 outline-none cursor-text ${
              hasError
                ? "bg-red-50/60 border border-red-300 text-red-700 ring-2 ring-red-500/15"
                : isFilled
                ? "bg-white border-2 border-[#FF5238] shadow-xs ring-2 ring-[#FF5238]/15"
                : "bg-[#FFF5F2] border border-[#FED7CC] hover:border-[#FFC4B4] focus:bg-white focus:border-[#FF5238] focus:ring-3 focus:ring-[#FF5238]/20"
            }`}
          />
        );
      })}
    </div>
  );
}
