import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { useParams } from "react-router-dom";
import { Star, ImagePlus, Loader2 } from "lucide-react";

// Cloudinary settings
const CLOUD_NAME = "dwgn4j1nu";
const UPLOAD_PRESET = "product_photos";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error("Cloudinary upload failed");
  return data.secure_url;
};

const ProductReview = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null); // For preview
  const [imageUrl, setImageUrl] = useState(""); // Uploaded url
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [imgUploading, setImgUploading] = useState(false);
  const token = localStorage.getItem("token");
  const fileInput = useRef();

  // Fetch all reviews
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}products/${id}/reviews`)
      .then((res) => {
        setReviews(res.data || []);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [id, successMsg]);

  // Check if user already reviewed
  useEffect(() => {
    if (token) {
      axios
        .get(`${BASE_URL}products/${id}/reviews`)
        .then((res) => {
          const reviews = res.data || [];
          let userId = null;
          try {
            userId =
              JSON.parse(atob(token.split(".")[1]))._id ||
              JSON.parse(atob(token.split(".")[1])).id;
          } catch {
            userId = null;
          }
          const found = reviews.find(
            (r) => r.user?._id === userId || r.user?.id === userId
          );
          setHasReviewed(!!found);
        })
        .catch(() => setHasReviewed(false));
    }
  }, [id, token, successMsg]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImageUrl("");
    setImgUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    } catch (err) {
      setFormError("Failed to upload image");
    } finally {
      setImgUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInput.current.files = e.dataTransfer.files;
      handleImageChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!rating || !comment.trim()) {
      setFormError("Please provide both rating and comment.");
      return;
    }
    if (imgUploading) {
      setFormError("Wait for the image to finish uploading!");
      return;
    }
    setSubmitLoading(true);
    try {
      await axios.post(
        `${BASE_URL}products/${id}/reviews`,
        { rating, comment, image: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg("Review submitted! Thank you.");
      setRating(0);
      setComment("");
      setImage(null);
      setImageUrl("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="col-span-full mt-10">
      <h3 className="text-2xl mb-4">Product Reviews</h3>

      {/* Add Review Card */}
      {token && !hasReviewed && (
        <form
          onSubmit={handleSubmit}
          className="mb-8-2xl border border-gray-300 via-white to-emerald-50 p-6 animate-fadein"
        >
          <div className="font-medium mb-2 text-lg flex items-center gap-2">
            <span>Add your review</span>
            <Star className="text-yellow-400" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="mr-2 text-sm text-gray-600">Your Rating:</span>
            {Array.from({ length: 5 }).map((_, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setRating(idx + 1)}
                className={idx < rating ? "text-yellow-400" : "text-gray-400"}
                tabIndex={0}
              >
                <Star size={28} fill={idx < rating ? "#facc15" : "none"} />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-lg font-bold">{rating}/5</span>
            )}
          </div>
          <textarea
            className="border border-blue-200 px-3 py-2-xl pt-2 w-full mb-2 outline-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience…"
            maxLength={500}
            rows={3}
            required
          />

          {/* Image Upload - Sexy Drag & Drop */}
          <div
            className="flex flex-col items-center border-2 border-dashed border-blue-200-xl p-4 mb-3 transition-all hover:border-blue-400 relative group cursor-pointer bg-white/70"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInput.current.click()}
            tabIndex={0}
          >
            {imgUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin mb-1" />
                <span className="text-sm">Uploading image…</span>
              </div>
            ) : imageUrl ? (
              <div className="relative w-36 h-36 overflow-hidden-xl shadow border">
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setImageUrl("");
                    fileInput.current.value = "";
                  }}
                  className="absolute top-1 right-1 bg-white bg-opacity-80-full p-1 shadow text-xs text-gray-700 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ImagePlus className="w-10 h-10 text-blue-400" />
                <span className="text-sm text-gray-500">
                  Click or drag an image here to upload (1 only)
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInput}
              onChange={handleImageChange}
              disabled={!!imageUrl}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="text-white px-6 py-2-2xl bg-blue-600 hover:cursor-pointer h-[40px] transition disabled:opacity-70"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} /> Submitting…
                </span>
              ) : (
                "Submit Review"
              )}
            </button>
            {formError && (
              <span className="text-red-600 text-xs">{formError}</span>
            )}
            {successMsg && (
              <span className="text-green-700 text-xs">{successMsg}</span>
            )}
          </div>
        </form>
      )}

      {token && hasReviewed && (
        <div className="mb-4 text-green-800 bg-green-50 border border-green-200 px-4 py-2 text-sm">
          You already submitted a review for this product.
        </div>
      )}

      {!token && (
        <div className="mb-4 text-yellow-800 bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm">
          Please log in to write a review.
        </div>
      )}

      {/* Show reviews */}
      {loading ? (
        <div className="text-gray-400">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="text-gray-400">No reviews yet.</div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white/80-2xl shadow p-5 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  {review.user?.fullName || "Unknown User"}
                </span>
                {review.isVerifiedBuyer && (
                  <span className="text-green-700 bg-green-100 px-2 text-xs ml-2">
                    Verified Buyer
                  </span>
                )}
                <div className="flex items-center ml-3">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={16}
                      className="text-yellow-400 fill-yellow-300"
                    />
                  ))}
                  <span className="ml-2 text-gray-500 text-xs">
                    {review.rating}/5
                  </span>
                </div>
              </div>
              {review.image && (
                <div className="flex justify-start mb-2">
                  <img
                    src={review.image}
                    alt="Review"
                    className="w-28 h-28 object-cover-lg shadow border"
                  />
                </div>
              )}
              <div className="text-gray-800 mb-1">{review.comment}</div>
              <div className="text-gray-400 text-xs">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReview;
