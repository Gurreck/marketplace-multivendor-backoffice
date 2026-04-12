import React from "react";
import "./VistaPreviaTarjeta.css";
import { getMaskedCardNumber } from "./utilsTarjeta";

const getCardLogo = (type) => {
    const logos = {
        VISA: (
            <svg width="100%" viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="visaGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1A1F71" />
                        <stop offset="100%" stopColor="#0D1257" />
                    </linearGradient>
                </defs>
                <rect x="0" y="0" width="400" height="220" rx="20" fill="url(#visaGrad)" />
                <rect x="0" y="0" width="400" height="22" rx="20" fill="#F5A623" />
                <rect x="0" y="11" width="400" height="11" fill="#F5A623" />
                <rect x="0" y="198" width="400" height="22" rx="20" fill="#F5A623" />
                <rect x="0" y="198" width="400" height="11" fill="#F5A623" />
                <text x="200" y="148" textAnchor="middle" fontFamily="Arial Black" fontWeight="900" fontSize="100" fill="white" letterSpacing="6">VISA</text>
            </svg>
        ),
        MASTERCARD: (
            <svg viewBox="0 0 48 32" width="50" height="34">
                <rect width="48" height="32" rx="4" fill="#000" />
                <circle cx="18" cy="16" r="9" fill="#EB001B" />
                <circle cx="30" cy="16" r="9" fill="#F79E1B" />
                <path d="M24 9.5a9 9 0 0 0 0 13" fill="#FF5F00" />
            </svg>
        ),
        AMEX: (
            <svg viewBox="0 0 48 32" width="50" height="34">
                <rect width="48" height="32" rx="4" fill="#006FCF" />
                <path d="M8 12h4l1 2.5 1-2.5h4v7h-3v-4.5l-1.5 3.5h-2l-1.5-3.5v4.5h-3v-7zm14 0h8v2h-5v.5h4.5v2h-4.5v.5h5v2h-8v-7zm10 0h3l2 3.5 2-3.5h3v7h-3v-4l-2 3.5h-2l-2-3.5v4h-3v-7z" fill="#fff" />
            </svg>
        ),
    };
    return logos[type] || <span className="texto-tipo-tarjeta-pasarela">{type || "CARD"}</span>;
};

const VistaPreviaTarjeta = ({ cardNumber, cardName, expiryDate, cardType }) => {
    return (
        <div className="columna-izquierda-tarjeta">
            <div className={`vista-previa-tarjeta-pasarela ${cardType ? cardType.toLowerCase() : ""}`}>
                <div className="chip-tarjeta-pasarela"></div>
                <div className="vista-previa-numero-tarjeta">
                    {getMaskedCardNumber(cardNumber)}
                </div>
                <div className="vista-previa-detalles-tarjeta">
                    <div className="vista-previa-nombre-tarjeta">
                        {cardName.toUpperCase() || "TITULAR"}
                    </div>
                    <div className="vista-previa-vencimiento-tarjeta">
                        {expiryDate || "MM/AA"}
                    </div>
                </div>
                <div className="vista-previa-logo-tarjeta">
                    {getCardLogo(cardType)}
                </div>
            </div>
        </div>
    );
};

export default VistaPreviaTarjeta;
