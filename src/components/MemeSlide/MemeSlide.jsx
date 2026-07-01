import { useState, useCallback } from 'react';
import { useSwiper } from 'swiper/react';
import { incrementMemeStats } from '../../services/supabaseClient';
import './MemeSlide.css';

export default function MemeSlide({ optionA, optionB, slideIndex, onChoice }) {
  const [chosen, setChosen] = useState(null);
  const [percentA, setPercentA] = useState(0);
  const swiper = useSwiper();

  const votesA = optionA.votes || 0;
  const viewsA = optionA.views || 0;
  const votesB = optionB.votes || 0;
  const viewsB = optionB.views || 0;

  const handleChoice = useCallback(
    async (choice) => {
      if (chosen) return;

      // Optimistic update of local percentages including the user's vote
      const newVotesA = choice === 'A' ? votesA + 1 : votesA;
      const newViewsA = viewsA + 1;
      const newVotesB = choice === 'B' ? votesB + 1 : votesB;
      const newViewsB = viewsB + 1;

      const newWinRateA = newViewsA > 0 ? (newVotesA / newViewsA) * 100 : 50;
      const newWinRateB = newViewsB > 0 ? (newVotesB / newViewsB) * 100 : 50;
      const newTotalRate = newWinRateA + newWinRateB;
      const newPercentA = newTotalRate > 0 ? Math.round((newWinRateA / newTotalRate) * 100) : 50;

      setPercentA(newPercentA);
      setChosen(choice);

      const isMajority = choice === 'A' ? newPercentA >= 50 : (100 - newPercentA) >= 50;
      if (onChoice) {
        onChoice(isMajority);
      }

      // Record to Supabase
      try {
        await incrementMemeStats(
          choice === 'A' ? optionA.id : optionB.id,
          choice === 'A' ? optionB.id : optionA.id
        );
      } catch (err) {
        console.error("Failed to record vote in Supabase:", err);
      }

      setTimeout(() => {
        if (swiper) {
          swiper.slideNext();
        }
      }, 1500); // 1.5s delay to let user see their choice's impact
    },
    [chosen, swiper, optionA.id, optionB.id, votesA, viewsA, votesB, viewsB, onChoice]
  );

  const percentB = 100 - percentA;

  return (
    <div className="meme-slide" id={`slide-${slideIndex}`}>
      <div className="slide-counter">
        <span className="slide-counter-hash">#</span>
        {slideIndex + 1}
      </div>

      <h2 className="slide-question">Which do you prefer?</h2>

      <div className="meme-cards">
        <button
          className={`meme-card ${chosen === 'A' ? 'chosen' : ''} ${chosen === 'B' ? 'dimmed' : ''} ${chosen ? 'revealed' : ''}`}
          onClick={() => handleChoice('A')}
          disabled={!!chosen}
          id={`card-a-${slideIndex}`}
          aria-label={`Choose: ${optionA.name}`}
        >
          <div className="meme-card-image-wrapper">
            <img
              src={optionA.url}
              alt={optionA.name}
              className="meme-card-image"
              loading="lazy"
            />
          </div>

          <div className="meme-card-footer">
            <span className="meme-card-label">{optionA.name}</span>
          </div>

          {chosen && (
            <div className="meme-card-result">
              <div
                className="meme-card-bar"
                style={{ '--bar-width': `${percentA}%` }}
              >
                <span className="meme-card-percent">{percentA}%</span>
              </div>
            </div>
          )}
        </button>

        <div className={`vs-badge ${chosen ? 'vs-revealed' : ''}`}>
          <span>VS</span>
        </div>

        <button
          className={`meme-card ${chosen === 'B' ? 'chosen' : ''} ${chosen === 'A' ? 'dimmed' : ''} ${chosen ? 'revealed' : ''}`}
          onClick={() => handleChoice('B')}
          disabled={!!chosen}
          id={`card-b-${slideIndex}`}
          aria-label={`Choose: ${optionB.name}`}
        >
          <div className="meme-card-image-wrapper">
            <img
              src={optionB.url}
              alt={optionB.name}
              className="meme-card-image"
              loading="lazy"
            />
          </div>

          <div className="meme-card-footer">
            <span className="meme-card-label">{optionB.name}</span>
          </div>

          {chosen && (
            <div className="meme-card-result">
              <div
                className="meme-card-bar"
                style={{ '--bar-width': `${percentB}%` }}
              >
                <span className="meme-card-percent">{percentB}%</span>
              </div>
            </div>
          )}
        </button>
      </div>

      {!chosen && (
        <div className="swipe-hint">
          <div className="swipe-hint-arrow">↓</div>
          <span>Swipe to next</span>
        </div>
      )}

      {chosen && (
        <p className="chosen-message">
          Good choice! Swipe to continue ↓
        </p>
      )}
    </div>
  );
}