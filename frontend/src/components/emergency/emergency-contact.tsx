"use client";

import { useState } from "react";

type EmergencyService = {
  id: string;
  name: string;
  number: string;
  description: string;
};

const EMERGENCY_SERVICES: EmergencyService[] = [
  {
    id: "112",
    name: "Jakarta Siaga 112",
    number: "112",
    description: "Layanan Panggilan Darurat",
  },
  {
    id: "1500813",
    name: "SIAP 1500813",
    number: "1500813",
    description: "Dishub DKI Jakarta",
  },
];

export function EmergencyContact() {
  const [open, setOpen] = useState(false);

  const [selectedService, setSelectedService] =
    useState<string | null>(null);

  const handleOpen = () => {
    setSelectedService(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedService(null);
  };

  const handleEmergencyCall = (
    service: EmergencyService,
  ) => {
    setSelectedService(service.id);

    window.setTimeout(() => {
      window.location.href = `tel:${service.number}`;
    }, 220);
  };

  return (
    <>
      {/* =====================================================
          HEADER EMERGENCY BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={handleOpen}
        aria-label="Emergency call"
        className="emergency-trigger"
      >
        <span className="emergency-trigger-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            role="img"
          >
            <path
              d="M7.2 4.8c.4-.4 1-.5 1.5-.2l2.2 1.6c.5.4.7 1 .4 1.6l-1 2.1c.9 1.8 2.1 3.1 3.9 3.9l2.1-1c.6-.3 1.2-.1 1.6.4l1.6 2.2c.3.5.2 1.1-.2 1.5l-1.4 1.4c-.7.7-1.7 1-2.7.8-2.7-.6-5.2-2-7.2-4S4.3 10.7 3.7 8c-.2-1 .1-2 .8-2.7l1.4-1.4c.4-.4.9-.5 1.3-.1Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className="emergency-trigger-copy">
          <strong>
            Emergency
          </strong>

          <small>
            Need help?
          </small>
        </span>
      </button>


      {/* =====================================================
          EMERGENCY MODAL
      ===================================================== */}

      {open && (
        <div
          className="emergency-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleClose();
            }
          }}
        >

          <div className="emergency-modal">

            {/* =================================================
                CLOSE BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close emergency menu"
              className="emergency-close"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6 6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>


            {/* =================================================
                TITLE
            ================================================= */}

            <div className="emergency-heading">

              <h2 id="emergency-title">
                Need help?
              </h2>

              <p>
                Pilih layanan darurat yang
                ingin kamu hubungi.
              </p>

            </div>


            {/* =================================================
                EMERGENCY SERVICES
            ================================================= */}

            <div className="emergency-services">

              {EMERGENCY_SERVICES.map(
                (service) => {

                  const isSelected =
                    selectedService ===
                    service.id;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      className={`
                        emergency-service
                        ${
                          isSelected
                            ? "is-selected"
                            : ""
                        }
                      `}
                      onClick={() =>
                        handleEmergencyCall(
                          service,
                        )
                      }
                    >

                      <span className="emergency-service-copy">

                        <strong>
                          {service.name}
                        </strong>

                        <span>
                          {service.description}
                        </span>

                      </span>


                      <span className="emergency-service-number">
                        {service.number}
                      </span>


                      <span
                        className="emergency-service-arrow"
                        aria-hidden="true"
                      >
                        →
                      </span>

                    </button>
                  );
                },
              )}

            </div>


            {/* =================================================
                FOOTER NOTE
            ================================================= */}

            <p className="emergency-note">
              Menekan layanan akan membuka
              aplikasi telepon pada perangkatmu.
            </p>

          </div>

        </div>
      )}


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        /* =====================================================
           HEADER BUTTON
        ===================================================== */

        .emergency-trigger {
          display: flex;

          align-items: center;

          gap: 11px;

          min-height: 52px;

          padding:
            6px 15px 6px 7px;

          border:
            1px solid
            rgba(255, 255, 255, 0.95);

          border-radius: 999px;

          background:
            #17151f;

          color: white;

          box-shadow:
            0 12px 30px
            rgba(23, 21, 31, 0.16);

          cursor: pointer;

          transition:
            transform 180ms
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            ),

            box-shadow 180ms ease;
        }


        .emergency-trigger:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 16px 36px
            rgba(23, 21, 31, 0.21);
        }


        .emergency-trigger:active {
          transform:
            scale(0.95);
        }


        .emergency-trigger-icon {
          display: grid;

          width: 40px;
          height: 40px;

          place-items: center;

          flex: 0 0 auto;

          border-radius: 50%;

          background:
            #ee5b9b;

          color:
            white;

          box-shadow:
            0 5px 16px
            rgba(238, 91, 155, 0.25);
        }

        .emergency-trigger-icon svg {
          width: 20px;
          height: 20px;
          display: block;
        }


        .emergency-trigger-copy {
          display: flex;

          flex-direction: column;

          align-items: flex-start;

          gap: 3px;
        }


        .emergency-trigger-copy strong {
          font-family:
            var(--font-display),
            Inter,
            sans-serif;

          font-size: 12px;

          font-weight: 700;

          line-height: 1;
        }


        .emergency-trigger-copy small {
          color:
            rgba(255, 255, 255, 0.55);

          font-size: 8px;

          font-weight: 500;

          line-height: 1;
        }


        /* =====================================================
           OVERLAY
           
           IMPORTANT:
           Overlay cukup gelap + blur.
           Modal di atas TIDAK transparan.
        ===================================================== */

        .emergency-overlay {
          position: fixed;

          inset: 0;

          z-index: 9999;

          display: grid;

          place-items: center;

          padding: 20px;

          background:
            rgba(
              23,
              21,
              31,
              0.48
            );

          backdrop-filter:
            blur(12px);

          -webkit-backdrop-filter:
            blur(12px);

          animation:
            emergency-overlay-in
            220ms ease both;
        }


        /* =====================================================
           MODAL

           Solid white supaya background halaman
           TIDAK tembus ke dalam modal.
        ===================================================== */

        .emergency-modal {
          position: relative;

          width:
            min(
              540px,
              calc(100vw - 32px)
            );

          padding:
            38px;

          border:
            1px solid
            rgba(255, 255, 255, 0.98);

          border-radius:
            30px;

          /*
            Hampir opaque.
            Tetap ada sedikit glass feel,
            tapi konten belakang tidak terlihat.
          */

          background:
            rgba(
              255,
              255,
              255,
              0.96
            );

          box-shadow:
            0 35px 100px
            rgba(
              23,
              21,
              31,
              0.28
            ),

            0 8px 30px
            rgba(
              23,
              21,
              31,
              0.10
            ),

            inset 0 1px 0
            rgba(
              255,
              255,
              255,
              1
            );

          /*
            Blur tetap dipakai untuk
            memberikan sedikit glass effect.
          */

          backdrop-filter:
            blur(28px);

          -webkit-backdrop-filter:
            blur(28px);

          animation:
            emergency-modal-in
            280ms
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            )
            both;
        }


        /* =====================================================
           CLOSE
        ===================================================== */

        .emergency-close {
          position: absolute;

          top: 18px;
          right: 18px;

          display: grid;

          width: 36px;
          height: 36px;

          place-items: center;

          border:
            1px solid
            rgba(
              23,
              21,
              31,
              0.06
            );

          border-radius: 50%;

          background:
            #f5f3f5;

          color:
            #85808c;

          cursor: pointer;

          transition:
            transform 180ms ease,
            background 180ms ease,
            color 180ms ease;
        }


        .emergency-close svg {
          width: 15px;
          height: 15px;
        }


        .emergency-close:hover {
          background:
            #fce4ef;

          color:
            #d94182;

          transform:
            rotate(6deg);
        }


        .emergency-close:active {
          transform:
            scale(0.9);
        }


        /* =====================================================
           TITLE
        ===================================================== */

        .emergency-heading {
          padding-right: 42px;
        }


        .emergency-heading h2 {
          margin: 0;

          font-family:
            var(--font-display),
            Inter,
            sans-serif;

          font-size:
            clamp(
              32px,
              5vw,
              43px
            );

          font-weight: 600;

          line-height: 0.98;

          letter-spacing:
            -0.065em;

          color:
            #17151f;
        }


        .emergency-heading p {
          max-width: 430px;

          margin:
            13px 0 0;

          color:
            #817b88;

          font-size: 11px;

          line-height: 1.6;
        }


        /* =====================================================
           SERVICES
        ===================================================== */

        .emergency-services {
          display: grid;

          gap: 10px;

          margin-top: 28px;
        }


        .emergency-service {
          position: relative;

          display: flex;

          align-items: center;

          width: 100%;

          min-height: 88px;

          padding:
            17px 17px
            17px 20px;

          border:
            1px solid
            #e9e5ea;

          border-radius: 20px;

          background:
            #faf9fa;

          color:
            #17151f;

          text-align: left;

          cursor: pointer;

          box-shadow:
            0 1px 0
            rgba(
              255,
              255,
              255,
              0.9
            );

          transition:
            transform 180ms
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            ),

            background 180ms ease,

            border-color 180ms ease,

            box-shadow 180ms ease;
        }


        .emergency-service:hover {
          transform:
            translateY(-2px);

          background:
            #ffffff;

          border-color:
            #efbfd5;

          box-shadow:
            0 10px 26px
            rgba(
              43,
              33,
              51,
              0.07
            );
        }


        /*
          Feedback ketika benar-benar ditekan.
        */

        .emergency-service:active {
          transform:
            scale(0.965);

          background:
            #f8d9e7;

          border-color:
            #ee5b9b;

          transition-duration:
            70ms;
        }


        /*
          Setelah dipilih.
        */

        .emergency-service.is-selected {
          background:
            #fce4ef;

          border-color:
            #ee5b9b;

          box-shadow:
            0 10px 28px
            rgba(
              238,
              91,
              155,
              0.14
            );
        }


        /* =====================================================
           SERVICE TEXT
        ===================================================== */

        .emergency-service-copy {
          display: flex;

          flex-direction: column;

          gap: 5px;

          min-width: 0;
        }


        .emergency-service-copy strong {
          font-family:
            var(--font-display),
            Inter,
            sans-serif;

          font-size: 13px;

          font-weight: 700;

          line-height: 1.1;
        }


        .emergency-service-copy span {
          color:
            #85808c;

          font-size: 9px;

          line-height: 1.2;
        }


        /* =====================================================
           NUMBER
        ===================================================== */

        .emergency-service-number {
          margin-left: auto;

          color:
            #85808c;

          font-family:
            var(--font-display),
            Inter,
            sans-serif;

          font-size: 9px;

          font-weight: 700;

          letter-spacing:
            0.02em;
        }


        /* =====================================================
           ARROW
        ===================================================== */

        .emergency-service-arrow {
          display: grid;

          width: 36px;
          height: 36px;

          place-items: center;

          margin-left: 8px;

          flex: 0 0 auto;

          border-radius: 50%;

          background:
            #eeebee;

          color:
            #17151f;

          font-size: 15px;

          transition:
            transform 180ms ease,
            background 180ms ease,
            color 180ms ease;
        }


        .emergency-service:hover
        .emergency-service-arrow {
          background:
            #17151f;

          color:
            white;

          transform:
            translateX(2px);
        }


        .emergency-service:active
        .emergency-service-arrow {
          background:
            #ee5b9b;

          color:
            white;

          transform:
            scale(0.90);
        }


        .emergency-service.is-selected
        .emergency-service-arrow {
          background:
            #17151f;

          color:
            white;
        }


        /* =====================================================
           FOOTER NOTE
        ===================================================== */

        .emergency-note {
          margin:
            22px 0 0;

          color:
            #9a94a0;

          font-size: 8px;

          line-height: 1.5;

          text-align: center;
        }


        /* =====================================================
           ANIMATION
        ===================================================== */

        @keyframes emergency-overlay-in {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }

        }


        @keyframes emergency-modal-in {

          from {
            opacity: 0;

            transform:
              translateY(16px)
              scale(0.965);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .emergency-trigger {
            min-height: 46px;

            padding:
              5px 11px
              5px 5px;
          }


          .emergency-trigger-icon {
            width: 36px;
            height: 36px;
          }

          .emergency-trigger-icon svg {
            width: 18px;
            height: 18px;
          }


          .emergency-trigger-copy strong {
            font-size: 10px;
          }


          .emergency-trigger-copy small {
            font-size: 7px;
          }


          .emergency-modal {
            width:
              calc(100vw - 24px);

            padding:
              29px 20px 23px;

            border-radius:
              25px;
          }


          .emergency-heading {
            padding-right: 35px;
          }


          .emergency-heading h2 {
            font-size: 32px;
          }


          .emergency-heading p {
            font-size: 10px;
          }


          .emergency-service {
            min-height: 80px;

            padding:
              14px;
          }


          .emergency-service-copy strong {
            font-size: 12px;
          }


          .emergency-service-copy span {
            font-size: 8px;
          }


          .emergency-service-number {
            display: none;
          }

        }


        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (
          prefers-reduced-motion: reduce
        ) {

          .emergency-overlay,
          .emergency-modal {
            animation: none;
          }

          .emergency-trigger,
          .emergency-service,
          .emergency-service-arrow,
          .emergency-close {
            transition: none;
          }

        }

      `}</style>
    </>
  );
}