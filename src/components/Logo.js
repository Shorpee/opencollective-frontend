import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getBaseImagesUrl } from '../lib/utils';

const Logo = ({ collective, src, style = {}, height, className }) => {
  style.maxHeight = style.height || height;
  const backgroundStyle = { height };
  if (height && parseInt(height, 10) == height) {
    backgroundStyle.minWidth = parseInt(height, 10) / 2;
  }
  if (collective) {
    src = `${getBaseImagesUrl()}/${collective.slug}/logo.png`;
  }
  return (
    <div className={classNames('Logo', className)} style={backgroundStyle}>
      <style jsx>
        {`
          .Logo {
            background-repeat: no-repeat;
            background-position: center center;
            background-size: cover;
            overflow: hidden;
            display: flex;
            align-items: center;
          }
          .image {
            background-repeat: no-repeat;
            background-position: center center;
            background-size: cover;
          }
        `}
      </style>
      <img className="logo" src={src} style={style} />
    </div>
  );
};

Logo.propTypes = {
  collective: PropTypes.object,
  src: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Logo;
