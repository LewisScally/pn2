/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminPanel from './pages/AdminPanel';
import AdvertiserDashboard from './pages/AdvertiserDashboard';
import AdvertiserOnboarding from './pages/AdvertiserOnboarding';
import Analytics from './pages/Analytics';
import CreateCampaign from './pages/CreateCampaign';
import CreateOffer from './pages/CreateOffer';
import Disputes from './pages/Disputes';
import Home from './pages/Home';
import ManageCampaigns from './pages/ManageCampaigns';
import ManageOffers from './pages/ManageOffers';
import Marketplace from './pages/Marketplace';
import OfferDetails from './pages/OfferDetails';
import PublisherDashboard from './pages/PublisherDashboard';
import PublisherOnboarding from './pages/PublisherOnboarding';
import PublisherProfile from './pages/PublisherProfile';
import UserTypeSelection from './pages/UserTypeSelection';
import pp from './pages/pp';
import tos from './pages/tos';
import Orders from './pages/Orders';
import CampaignComparison from './pages/CampaignComparison';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminPanel": AdminPanel,
    "AdvertiserDashboard": AdvertiserDashboard,
    "AdvertiserOnboarding": AdvertiserOnboarding,
    "Analytics": Analytics,
    "CreateCampaign": CreateCampaign,
    "CreateOffer": CreateOffer,
    "Disputes": Disputes,
    "Home": Home,
    "ManageCampaigns": ManageCampaigns,
    "ManageOffers": ManageOffers,
    "Marketplace": Marketplace,
    "OfferDetails": OfferDetails,
    "PublisherDashboard": PublisherDashboard,
    "PublisherOnboarding": PublisherOnboarding,
    "PublisherProfile": PublisherProfile,
    "UserTypeSelection": UserTypeSelection,
    "pp": pp,
    "tos": tos,
    "Orders": Orders,
    "CampaignComparison": CampaignComparison,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};