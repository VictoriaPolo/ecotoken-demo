import { useState } from 'react';
import { CATEGORY_LABEL, LISTINGS } from '../data/catalog';
import { balance } from '../engine/rules';
import type { Category } from '../engine/types';
import { eco } from '../ui/format';
import { Pictogram } from '../ui/Pictogram';
import { useDemo } from './store';

const FILTERS: (Category | 'todo')[] = ['todo', 'servicio', 'producto', 'evento', 'canje'];

export function Market() {
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState<Category | 'todo'>('todo');
  const e = state.economy;
  const me = e.members.find((m) => m.id === state.me)!;
  const myBal = balance(me);
  const items = LISTINGS.filter((l) => filter === 'todo' || l.category === filter);

  return (
    <div className="market">
      <div className="market__head">
        <h3>Marketplace solidario</h3>
        <div className="chips" role="radiogroup" aria-label="Filtrar por tipo">
          {FILTERS.map((f) => (
            <button key={f} role="radio" aria-checked={filter === f} onClick={() => setFilter(f)}>
              {f === 'todo' ? 'Todo' : CATEGORY_LABEL[f]}
            </button>
          ))}
        </div>
        <p className="market__bal">
          Tienes <b>{eco(myBal)}</b>
        </p>
      </div>
      <ul className="offers">
        {items.map((l) => {
          const seller = e.members.find((m) => m.id === l.sellerId)!;
          const own = seller.id === me.id;
          const room = e.config.walletCap - balance(seller);
          const short = myBal < l.price;
          return (
            <li key={l.id} className={`offer offer--${l.category}`}>
              <div className="offer__icon">
                <Pictogram name={l.icon} />
              </div>
              <div className="offer__main">
                <p className="offer__cat">{CATEGORY_LABEL[l.category]}</p>
                <h4>{l.title}</h4>
                <p className="offer__detail">{l.detail}</p>
                <p className="offer__seller">
                  <span className={`avatar ${seller.role === 'organizacion' ? 'avatar--org' : ''}`}>{seller.initials}</span>
                  {own ? 'Tu oferta' : seller.name}
                  {seller.dormant && !own && <em className="offer__flag">sin actividad reciente</em>}
                </p>
                {!own && room < l.price && (
                  <p className="offer__cap">
                    {seller.name.split(' ')[0]} está cerca del tope: {eco(l.price - Math.max(0, room))} de este pago irán
                    al fondo comunitario.
                  </p>
                )}
              </div>
              <div className="offer__stub">
                <p className="offer__price">
                  {l.price}
                  <span>ECO</span>
                </p>
                <button
                  className="pill pill--ink"
                  disabled={own || short}
                  onClick={() => dispatch({ type: 'buy', listingId: l.id })}
                  title={short ? `Te faltan ${l.price - myBal} ECO` : undefined}
                >
                  {own ? 'Es tuya' : short ? `Faltan ${l.price - myBal}` : 'Pagar'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
