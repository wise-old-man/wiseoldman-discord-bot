/* eslint-disable no-undef */
import React, { useEffect } from 'react';
import Head from '@docusaurus/Head';
import BrowserOnly from '@docusaurus/BrowserOnly';

const PREVIEW_IMAGE_PATHS = [
  '/img/discord_preview_1.png',
  '/img/discord_preview_2.png',
  '/img/discord_preview_3.png'
];

const INVITE_URL =
  'https://discord.com/api/oauth2/authorize?client_id=719720369241718837&permissions=2147543040&scope=applications.commands%20bot';

const BASE_PATH =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://bot.wiseoldman.net';

const DOCS_URL = `${BASE_PATH}/how-to-setup`;

const DESCRIPTION = `Track your Old School Runescape clan's progress from your own Discord server.`;

// Could I make this dynamic? yes sure, but who cares,
// I'll just manually update it every few months
const STATIC_SERVER_COUNT = '7k';

function Homepage() {
  // This is a scroll effect for the bg glow and WOM character
  useEffect(() => {
    const listener = window.addEventListener('scroll', e => {
      const scrollPercent = window.scrollY / 500;

      const glowElement = document.getElementById('glow');
      const womElement = document.getElementById('wom');

      if (glowElement) {
        glowElement.style.opacity = 1 - scrollPercent;
      }

      if (womElement) {
        womElement.style.opacity = 1 - scrollPercent;
        womElement.style.filter = `blur(${10 * scrollPercent}px)`;
        womElement.style.transform = `translateY(${scrollPercent * 100}px)`;
      }
    });

    return () => {
      window.removeEventListener('scroll', listener);
    };
  }, []);

  return (
    <>
      <Head>
        <meta property="og:image" content="/img/og.png" />
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:description" content={DESCRIPTION} />
      </Head>
      <div className="bg-[#171717] relative">
        <div id="glow" className="absolute homepage-glow h-full inset-0 min-h-screen" />
        <div className="relative flex flex-col items-center mb-40">
          <h1 className="pt-20 mb-0 pb-2 md:pb-4 uppercase text-4xl md:text-[3.25rem] text-transparent bg-clip-text font-bold bg-gradient-to-t to-[#3B82F6] from-[#2563EB]">
            Wise Old Man
          </h1>
          <h2 className="uppercase bg-white text-[#1F3A75] text-sm md:text-xl px-1 md:px-2 font-mono rounded leading-2 pt-[1px]">
            Discord Bot
          </h2>
          <p className="text-lg md:text-xl w-full mb-2 max-w-sm sm:max-w-md md:max-w-lg text-center leading-9 font-light mt-5">
            Track your Old School Runescape clan&apos;s progress from your own Discord server.
          </p>
          <div className="relative w-full flex justify-center">
            <img id="wom" src="/img/wom_character.png" className="w-[297px] h-[390px]" />
            <div className="absolute bottom-16 right-0 left-0 flex flex-col items-center space-y-4">
              <CallToActionBar />
              <LinksBar />
            </div>
          </div>
          <div className="-mt-12 z-10 w-full overflow-hidden">
            <PreviewSlideShow />
          </div>
          <div className="mx-5">
            <div className="border border-white/10 w-full lg:w-[838px] rounded-lg mt-10 p-6 md:p-12 border-solid bg-black/20 shadow-lg">
              <h2 className="text-2xl md:text-3xl">What is this bot?</h2>
              <p className="text-white/70 md:leading-7 leading-6 text-sm md:text-[0.875rem]">
                The Wise Old Man Discord bot is one of the elements in the Wise Old Man project. It
                allows you to interface with the core Wise Old Man application through your Discord
                server and helps you keep track of your clan&apos;s gains, latest achievements and
                upcoming/ongoing competitions, etc.
              </p>
              <div className="flex md:flex-row flex-col space-y-5 md:space-y-0 md:space-x-10 mt-7">
                <a href={DOCS_URL} className="text-[#60A5FA] font-semibold text-sm">
                  Learn how to setup
                </a>
                <a href={`${BASE_PATH}/commands`} className="text-[#60A5FA] font-semibold text-sm">
                  Browse the features
                </a>
                <a
                  href="https://wiseoldman.net/discord"
                  className="text-[#60A5FA] font-semibold text-sm"
                >
                  Join our Discord for help
                </a>
              </div>
            </div>
            <div className="border border-white/10 w-full lg:w-[838px] rounded-lg mt-10 p-6 md:p-12 border-solid bg-black/20 shadow-lg">
              <h2 className="text-2xl md:text-3xl">What is the Wise Old Man?</h2>
              <p className="text-white/70 md:leading-7 leading-6 text-sm md:text-[0.875rem]">
                WOM is a web application that tracks your progress in Old School Runescape. Built on top
                of the official OSRS hiscores, it helps you keep track of your gains, earn your ranks on
                the global leaderboards, participate in group competitions, collect achievements and much
                more.
              </p>
              <a href="https://wiseoldman.net" className="mt-7 text-[#60A5FA] font-semibold text-sm">
                Check out the app
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LinksBar() {
  return (
    <div className="flex space-x-3">
      <a
        href="https://github.com/wise-old-man/discord-bot"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-black/50 bg-black/70 text-sm md:text-sm font-semibold text-white !decoration-transparent hover:text-white py-2 px-4 rounded flex space-x-2 items-center pl-3"
      >
        <img src="/img/github.svg" className="w-5 h-5" />
        <span className="hidden md:block">Contribute on Github</span>
        <span className="block md:hidden">Github</span>
      </a>
      <a
        href="https://wiseoldman.net/discord"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-black/50 bg-black/70 text-sm md:text-sm font-semibold text-white !decoration-transparent hover:text-white py-2 px-4 rounded flex space-x-2 items-center pl-3"
      >
        <img src="/img/discord.svg" className="w-5 h-5" />
        <span className="hidden md:block">Join our Discord</span>
        <span className="block md:hidden">Discord</span>
      </a>
      <a
        href="https://wiseoldman.net"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-black/50 bg-black/70 text-sm md:text-sm font-semibold text-white !decoration-transparent hover:text-white py-2 px-4 rounded flex space-x-2 items-center pl-3"
      >
        <img src="/img/web.svg" className="w-5 h-5" />
        <span className="hidden md:block">Visit wiseoldman.net</span>
        <span className="block md:hidden">wiseoldman.net</span>
      </a>
    </div>
  );
}

function CallToActionBar() {
  return (
    <div className="rounded-lg bg-black/40 flex space-x-3 p-3 md:space-x-5 md:p-5">
      <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="!decoration-transparent">
        <Button color="blue">
          Invite to Discord
          <div className="h-3 md:h-4 w-[1px] ml-5 mr-3 bg-white/30" />
          <span className="text-xs md:text-sm font-normal md:-mr-2 border-l border-white">
            {STATIC_SERVER_COUNT}
          </span>
        </Button>
      </a>
      <a href={DOCS_URL} className="!decoration-transparent">
        <Button color="gray">Read documentation</Button>
      </a>
    </div>
  );
}

function Button(props) {
  const { color, children, ...buttonProps } = props;

  const backgroundColor = color === 'blue' ? '#2563EB' : '#313131';
  const hoverBackgroundColor = color === 'blue' ? '#1D59DE' : '#252424';

  return (
    <button
      {...buttonProps}
      style={{
        '--background-color': backgroundColor,
        '--hover-background-color': hoverBackgroundColor
      }}
      className="text-white w-full justify-center flex items-center bg-[var(--background-color)] hover:bg-[var(--hover-background-color)] md:text-[1rem] text-[0.875rem] hover:cursor-pointer font-sans py-2 px-3 md:py-3 md:px-5 rounded font-semibold border-0 border-t border-white/10 shadow-md"
    >
      {children}
    </button>
  );
}

function PreviewSlideShow() {
  return (
    <div className="text-center relative">
      <div className="hidden md:block">
        <BrowserOnly
          fallback={<img className="px-5" src={PREVIEW_IMAGE_PATHS[0]} width={838} height={634} />}
        >
          {() => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Fade = require('react-slideshow-image').Fade;
            require('react-slideshow-image/dist/styles.css');

            return (
              <>
                <div className="absolute inset-0">
                  <img src={'/img/discord_preview_empty.png'} width={838} height={634} />
                </div>
                <Fade arrows={false} transitionDuration={500} duration={2000}>
                  {PREVIEW_IMAGE_PATHS.map(image => (
                    <img key={image} src={image} width={838} height={634} />
                  ))}
                </Fade>
              </>
            );
          }}
        </BrowserOnly>
      </div>

      <img className="md:hidden block w-full px-5" src={PREVIEW_IMAGE_PATHS[0]} />
    </div>
  );
}

export default Homepage;
