import React from 'react';
import { TruckIcon, CheckCircleIcon, PackageIcon, NavigationIcon } from '../common/Icons';

function TripTimeline({ status = 'ACTIVE', compact = false }) {
  // Determine current step index based on status
  // 0 = Dispatched, 1 = In Transit, 2 = Delivered
  let currentStep = 1;
  if (status === 'COMPLETED') {
    currentStep = 2;
  } else if (status === 'CANCELLED') {
    currentStep = -1;
  } else {
    // ACTIVE
    currentStep = 1;
  }

  const steps = [
    {
      label: 'Dispatched',
      sublabel: 'Carrier departed hub',
      icon: PackageIcon,
    },
    {
      label: 'In Transit',
      sublabel: 'En route to destination',
      icon: NavigationIcon,
    },
    {
      label: 'Delivered',
      sublabel: 'Arrival confirmed',
      icon: CheckCircleIcon,
    },
  ];

  if (compact) {
    // Small inline mini-progress bar for table rows without any text that could alter cell textContent
    const progressPercent = status === 'COMPLETED' ? 100 : status === 'CANCELLED' ? 100 : 65;
    const progressColor = status === 'COMPLETED' ? '#10b981' : status === 'CANCELLED' ? '#94a3b8' : '#1065B4';

    return (
      <div className="trip-mini-timeline" title={`Stage: ${status === 'COMPLETED' ? 'Delivered' : status === 'CANCELLED' ? 'Trip Cancelled' : 'In Transit'}`}>
        <div className="mini-timeline-bar">
          <div
            className="mini-timeline-fill"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="trip-timeline-tracker">
      <div className="timeline-stages-wrapper">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isDone = currentStep >= index;
          const isActive = currentStep === index && status !== 'COMPLETED' && status !== 'CANCELLED';
          const isCancelled = status === 'CANCELLED' && index >= 1;

          return (
            <React.Fragment key={step.label}>
              {index > 0 && (
                <div
                  className={`timeline-connector ${
                    currentStep >= index ? 'connector-active' : ''
                  } ${isCancelled ? 'connector-cancelled' : ''}`}
                />
              )}

              <div
                className={`timeline-step ${
                  isDone ? 'step-done' : ''
                } ${isActive ? 'step-active' : ''} ${isCancelled ? 'step-cancelled' : ''}`}
              >
                <div className="step-icon-bubble">
                  {isActive ? (
                    <TruckIcon size={16} color="#ffffff" className="pulsing-truck" />
                  ) : (
                    <StepIcon size={15} color={isDone ? '#ffffff' : '#94a3b8'} />
                  )}
                </div>
                <div className="step-content">
                  <span className="step-title">{step.label}</span>
                  <span className="step-sublabel">{step.sublabel}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default TripTimeline;
