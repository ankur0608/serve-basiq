"use client";

import {
    FaBoxOpen,
    FaTruckFast,
    FaUserTie,
    FaPhone,
} from "react-icons/fa6";
import clsx from "clsx";
import { FaCircleCheck } from 'react-icons/fa6';

// Helper for status colors
const getStatusBadge = (status: string) => {
    switch (status) {
        case "DELIVERED":
        case "COMPLETED":
        case "APPROVED":
            return "bg-green-100 text-green-700 border-green-200";
        case "SHIPPED":
        case "CONFIRMED":
            return "bg-orange-100 text-orange-700 border-orange-200";
        case "CANCELLED":
        case "REJECTED":
            return "bg-red-100 text-red-700 border-red-200";
        default:
            return "bg-blue-50 text-blue-600 border-blue-100";
    }
};

const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export default function ActivityTabs({
    data,
    type,
}: {
    data: any[];
    type: "orders" | "bookings";
}) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FaBoxOpen className="text-4xl mb-2 opacity-50" />
                <p className="text-sm font-medium">No {type} found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((item) => {
                const isOrder = type === "orders";
                const isRental = item.type === "RENTAL";

                const title = item.title ||
                    item.product?.name ||
                    item.service?.name ||
                    item.rental?.name;

                const image = item.image ||
                    item.product?.productImage ||
                    item.service?.serviceimg ||
                    item.service?.mainimg ||
                    item.service?.coverImg ||
                    item.rental?.rentalImg ||
                    item.rental?.coverImg;

                const price = item.price ||
                    item.totalPrice ||
                    item.service?.price ||
                    0;

                // ✅ Check if this item is a Quote request
                const isQuote = item.service?.priceType === 'QUOTE' || item.rental?.priceType === 'QUOTE';

                const providerName = item.bookingOwner?.name ||
                    item.bookingOwner?.shopName ||
                    "Unknown Provider";

                const providerPhone = item.bookingOwner?.phone;

                const idLabel = isOrder ? "#ORD" : (isRental ? "#RNT" : "#BKG");
                const itemId = item.id.slice(-4).toUpperCase();

                return (
                    <div
                        key={item.id}
                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-5 items-start md:items-center group"
                    >
                        {/* Left: Image or Fallback Icon */}
                        <div className="relative w-14 h-14 shrink-0">
                            {image ? (
                                <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover rounded-2xl border border-gray-100"
                                />
                            ) : (
                                <div
                                    className={clsx(
                                        "w-full h-full rounded-2xl flex items-center justify-center text-xl font-bold border",
                                        isOrder
                                            ? "bg-green-50 text-green-600 border-green-100"
                                            : "bg-blue-50 text-blue-600 border-blue-100",
                                    )}
                                >
                                    {title?.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Middle: Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                                        {title}{" "}
                                        <span className="text-gray-400 text-xs font-medium ml-1">
                                            {idLabel}
                                            {itemId}
                                        </span>
                                    </h4>
                                    <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1.5">
                                                <FaUserTie className="text-gray-400 text-xs" />{" "}
                                                {providerName}
                                            </span>

                                            {/* Call Button */}
                                            {providerPhone && (
                                                <a
                                                    href={`tel:${providerPhone}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                                    title="Call Provider"
                                                >
                                                    <FaPhone size={10} />
                                                </a>
                                            )}
                                        </div>

                                        <span className="flex items-center gap-1.5">
                                            {item.status === "DELIVERED" ||
                                                item.status === "COMPLETED" ? (
                                                <FaCircleCheck className="text-green-500 text-xs" />
                                            ) : (
                                                <FaTruckFast className="text-gray-400 text-xs" />
                                            )}
                                            <span className="font-medium text-slate-700">
                                                {item.status === "DELIVERED" ? "Delivered: " : "ETA: "}{" "}
                                                {formatDate(item.updatedAt || item.createdAt)}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Price & Status */}
                        <div className="w-full md:w-auto flex md:flex-col justify-between md:items-end gap-2 md:gap-1 mt-2 md:mt-0 pl-0 md:pl-4 md:border-l md:border-gray-50">

                            {/* ✅ Dynamic Price Display */}
                            <div className="text-xl font-extrabold text-slate-900">
                                {isQuote ? (
                                    <span className="text-sm font-bold text-slate-500">Quote Requested</span>
                                ) : (
                                    `₹${price}`
                                )}
                            </div>

                            <span
                                className={clsx(
                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1",
                                    getStatusBadge(item.status),
                                )}
                            >
                                {item.status}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}