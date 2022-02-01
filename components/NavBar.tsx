import { shortenAddress, useEthers } from "@usedapp/core";

const NavBar = () => {
  const { activateBrowserWallet, deactivate, account } = useEthers();
  return (
    <nav className="flex justify-between text-xl">
      <div className="text-6xl font-extrabold">ExChainGe</div>
      <div>
        {account ? (
          shortenAddress(account)
        ) : (
          <button onClick={() => activateBrowserWallet((err) => alert(err))}>
            Connect
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
