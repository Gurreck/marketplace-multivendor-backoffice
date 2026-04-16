import React, { useState } from 'react';
import { FileText, X, Shield, Scale, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import './TerminosCondiciones.css';

export default function TerminosCondiciones({ aceptado, onChange }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="tc-checkbox-row">
        <label className="tc-checkbox-label">
          <input
            type="checkbox"
            checked={aceptado}
            onChange={(e) => onChange(e.target.checked)}
            className="tc-checkbox"
          />
          <span className="tc-checkmark"></span>
          <span className="tc-text">
            He leído y acepto los{' '}
            <button type="button" className="tc-link" onClick={() => setShowModal(true)}>
              Términos y Condiciones
            </button>
          </span>
        </label>
      </div>

      {showModal && (
        <div className="tc-overlay" onClick={() => setShowModal(false)}>
          <div className="tc-modal" onClick={e => e.stopPropagation()}>
            <div className="tc-modal-header">
              <h2><FileText size={22} /> Términos y Condiciones</h2>
              <button className="tc-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="tc-modal-body">
              <div className="tc-section">
                <h3><Shield size={18} /> 1. Aceptación de los Términos</h3>
                <p>
                  Al registrarse y utilizar la plataforma Nexora Marketplace, usted acepta estar sujeto a estos 
                  Términos y Condiciones de uso. Si no está de acuerdo con alguno de estos términos, le recomendamos 
                  no utilizar nuestros servicios.
                </p>
              </div>

              <div className="tc-section">
                <h3><Users size={18} /> 2. Registro y Cuentas</h3>
                <p>
                  Para utilizar los servicios de Nexora, usted debe proporcionar información veraz, precisa y 
                  actualizada durante el proceso de registro. Es responsable de mantener la confidencialidad de 
                  su contraseña y de todas las actividades que se realicen bajo su cuenta.
                </p>
                <ul>
                  <li>Debe ser mayor de 18 años para crear una cuenta.</li>
                  <li>No puede crear múltiples cuentas con fines fraudulentos.</li>
                  <li>La contraseña debe cumplir con los requisitos de seguridad establecidos.</li>
                  <li>Es su responsabilidad notificar inmediatamente cualquier uso no autorizado.</li>
                </ul>
              </div>

              <div className="tc-section">
                <h3><Scale size={18} /> 3. Uso de la Plataforma</h3>
                <p>
                  Nexora Marketplace es una plataforma multivendor que conecta compradores y vendedores. 
                  Al utilizar nuestra plataforma, usted se compromete a:
                </p>
                <ul>
                  <li>No publicar contenido ilegal, ofensivo o fraudulento.</li>
                  <li>No manipular precios, reseñas o calificaciones de productos.</li>
                  <li>Cumplir con todas las leyes aplicables en su jurisdicción.</li>
                  <li>No interferir con el funcionamiento normal de la plataforma.</li>
                  <li>Respetar los derechos de propiedad intelectual de terceros.</li>
                </ul>
              </div>

              <div className="tc-section">
                <h3><Shield size={18} /> 4. Privacidad y Protección de Datos</h3>
                <p>
                  Nexora se compromete a proteger la información personal de sus usuarios de acuerdo con las 
                  leyes de protección de datos vigentes. Los datos recopilados se utilizarán exclusivamente para:
                </p>
                <ul>
                  <li>Proporcionar y mejorar nuestros servicios.</li>
                  <li>Procesar transacciones y envíos.</li>
                  <li>Comunicaciones relacionadas con su cuenta y pedidos.</li>
                  <li>Prevención de fraude y seguridad de la plataforma.</li>
                </ul>
              </div>

              <div className="tc-section">
                <h3><AlertTriangle size={18} /> 5. Política de Devoluciones</h3>
                <p>
                  Los usuarios tienen derecho a solicitar devoluciones dentro de los plazos establecidos 
                  por la plataforma. Las solicitudes de devolución serán evaluadas por el equipo de soporte 
                  y estarán sujetas a las condiciones del producto y del vendedor.
                </p>
              </div>

              <div className="tc-section">
                <h3><CheckCircle size={18} /> 6. Responsabilidades del Vendedor</h3>
                <p>
                  Los vendedores registrados en Nexora se comprometen a:
                </p>
                <ul>
                  <li>Mantener información precisa y actualizada de sus productos.</li>
                  <li>Cumplir con los plazos de envío establecidos.</li>
                  <li>Garantizar la calidad de los productos ofrecidos.</li>
                  <li>Responder oportunamente a las consultas y reclamos de los clientes.</li>
                  <li>Cumplir con todas las obligaciones tributarias y legales.</li>
                </ul>
              </div>

              <div className="tc-section">
                <h3><Scale size={18} /> 7. Limitación de Responsabilidad</h3>
                <p>
                  Nexora actúa como intermediario entre compradores y vendedores. No nos hacemos responsables 
                  de la calidad, seguridad o legalidad de los productos publicados, ni de la veracidad de la 
                  información proporcionada por los usuarios. Nuestra responsabilidad se limita a proporcionar 
                  la plataforma tecnológica para facilitar las transacciones.
                </p>
              </div>

              <div className="tc-section">
                <h3><Shield size={18} /> 8. Modificaciones</h3>
                <p>
                  Nexora se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. 
                  Las modificaciones serán efectivas una vez publicadas en la plataforma. El uso continuado de 
                  los servicios después de cualquier modificación constituye la aceptación de los nuevos términos.
                </p>
              </div>

              <p className="tc-footer-text">
                <em>Última actualización: Abril 2026</em>
              </p>
            </div>
            <div className="tc-modal-footer">
              <button className="tc-accept-btn" onClick={() => { onChange(true); setShowModal(false); }}>
                <CheckCircle size={18} /> Acepto los Términos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
