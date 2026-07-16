import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import FlowHeader from "../components/FlowHeader";
import RouteLine from "../components/RouteLine";
import Button from "../components/Button";
import { useBooking } from "../context/BookingContext";
import { uploadItemImage, imageUrl, ApiError } from "../utils/api";
import "./ItemDetails.css";

const SIZES = [
  { id: "small", label: "Small", hint: "Fits in a backpack", icon: "📦" },
  { id: "medium", label: "Medium", hint: "A box or two", icon: "🧳" },
  { id: "large", label: "Large", hint: "Needs a mini-van", icon: "🛻" },
];

const ITEM_TYPES = [
  "Grocery & Supermarket",
  "Food & Restaurants",
  "Meat, Fish & Poultry",
  "Pharmacy & Healthcare",
  "Bakery & Cakes",
  "Laundry & Dry Cleaning",
  "Fashion & Clothing",
  "Electronics & Accessories",
  "Gifts & Flowers",
  "Personal Care",
  "Courier",
  "Documents",
  "Home Essentials",
  "Pet Supplies",
  "Auto Parts & Accessories",
  "Books & Stationery",
  "Hardware & Tools",
  "Frozen Items",
  "Store Pickup",
];

export default function ItemDetails() {
  const navigate = useNavigate();
  const { booking, setItem } = useBooking();
  const { item } = booking;
  const fileInputRef = useRef(null);

  // Local-only upload UI state — the actual image URL lives in
  // booking.item.imageUrl once the upload to the backend succeeds.
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | uploading | error
  const [uploadError, setUploadError] = useState("");
  const [localPreview, setLocalPreview] = useState(null);

  useEffect(() => {
    if (!booking.pickup || !booking.drop) {
      navigate("/book/locations");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canContinue =
    item.itemType.length > 0 &&
    item.recipientName.trim().length > 1 &&
    /^[6-9]\d{9}$/.test(item.recipientPhone.trim()) &&
    uploadStatus !== "uploading";

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalPreview(URL.createObjectURL(file));
    setUploadStatus("uploading");
    setUploadError("");

    try {
      const result = await uploadItemImage(file);
      // Store the server-relative URL — this is what gets sent to
      // the backend later and forwarded to WhatsApp as the actual
      // photo, not just kept in this browser tab.
      setItem({ imageUrl: result.url, imageName: file.name });
      setUploadStatus("idle");
    } catch (err) {
      setUploadStatus("error");
      if (err instanceof ApiError && err.data?.error === "UNSUPPORTED_FILE_TYPE") {
        setUploadError("That file type isn't supported. Use JPG, PNG, WEBP, or HEIC.");
      } else if (err instanceof ApiError && err.data?.error === "FILE_TOO_LARGE") {
        setUploadError("That image is too large. Keep it under 8MB.");
      } else if (err instanceof ApiError && err.data?.error === "NETWORK_ERROR") {
        setUploadError("Can't reach the server. Is the BRINZO backend running?");
      } else {
        setUploadError("Upload failed. Try again.");
      }
    }
  }

  function handleRemoveImage() {
    setItem({ imageUrl: null, imageName: null });
    setLocalPreview(null);
    setUploadStatus("idle");
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const displaySrc = localPreview || imageUrl(item.imageUrl);

  return (
    <PageShell>
      <FlowHeader title="What are we carrying?" step={2} totalSteps={5} />
      <div className="page-shell__body">
        <div className="item-route-summary">
          <RouteLine
            pickupLabel={booking.pickup?.description}
            dropLabel={booking.drop?.description}
            compact
          />
        </div>

        {/* Item Type Dropdown */}
        <label className="item-field">
          <span className="item-field__label">Item type</span>
          <select
            className="item-field__input item-field__select"
            value={item.itemType}
            onChange={(e) => setItem({ itemType: e.target.value })}
          >
            <option value="">Select a category…</option>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        {/* Item Image Upload */}
        <div className="item-field">
          <span className="item-field__label">Item image <span className="item-field__optional">(optional)</span></span>

          {displaySrc ? (
            <div className="item-image-preview">
              <div className="item-image-preview__thumb-wrap">
                <img src={displaySrc} alt="Item" className="item-image-preview__img" />
                {uploadStatus === "uploading" && (
                  <div className="item-image-preview__uploading">
                    <span className="item-image-preview__spinner" />
                  </div>
                )}
              </div>
              <div className="item-image-preview__info">
                <span className="item-image-preview__name">
                  {uploadStatus === "uploading" ? "Uploading…" : (item.imageName || "Photo attached")}
                </span>
                {uploadStatus !== "uploading" && (
                  <button
                    type="button"
                    className="item-image-preview__remove"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="item-image-upload"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="item-image-upload__icon">📷</span>
              <span className="item-image-upload__text">Upload item photo</span>
              <span className="item-image-upload__hint">Tap to browse</span>
            </button>
          )}

          {uploadStatus === "error" && (
            <div className="item-image-error">
              <span>{uploadError}</span>
              <button
                type="button"
                className="item-image-error__retry"
                onClick={() => fileInputRef.current?.click()}
              >
                Retry
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>

        <span className="item-field__label">Size</span>
        <div className="item-size-grid">
          {SIZES.map((s) => (
            <button
              type="button"
              key={s.id}
              className={`item-size-card ${item.size === s.id ? "item-size-card--active" : ""}`}
              onClick={() => setItem({ size: s.id })}
            >
              <span className="item-size-card__icon">{s.icon}</span>
              <span className="item-size-card__label">{s.label}</span>
              <span className="item-size-card__hint">{s.hint}</span>
            </button>
          ))}
        </div>

        <div className="item-field-row">
          <label className="item-field">
            <span className="item-field__label">Recipient name</span>
            <input
              className="item-field__input"
              type="text"
              placeholder="Who's receiving it"
              value={item.recipientName}
              onChange={(e) => setItem({ recipientName: e.target.value })}
            />
          </label>
          <label className="item-field">
            <span className="item-field__label">Recipient phone</span>
            <div className="item-field__phone">
              <span className="item-field__prefix mono">+91</span>
              <input
                className="item-field__input item-field__input--phone"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit number"
                maxLength={10}
                value={item.recipientPhone}
                onChange={(e) => setItem({ recipientPhone: e.target.value.replace(/\D/g, "") })}
              />
            </div>
          </label>
        </div>

        <label className="item-field item-field--notes">
          <span className="item-field__label">Note for delivery partner <span className="item-field__optional">(optional)</span></span>
          <textarea
            className="item-field__input item-field__input--textarea"
            placeholder="e.g. Call before arriving, fragile items, leave at gate…"
            value={item.notes}
            maxLength={200}
            rows={3}
            onChange={(e) => setItem({ notes: e.target.value })}
          />
        </label>

        <div className="locations-spacer" />
        <Button
          variant="primary"
          size="lg"
          full
          disabled={!canContinue}
          onClick={() => navigate("/book/service")}
        >
          {uploadStatus === "uploading" ? "Uploading photo…" : "Continue"}
        </Button>
      </div>
    </PageShell>
  );
}
