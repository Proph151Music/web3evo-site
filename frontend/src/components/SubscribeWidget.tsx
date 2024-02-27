import TextInput from './TextInput';
import Button from './ui/Button';

export default function SubscribeWidget() {
  return (
    <div className="subscribe-widget">
      <TextInput placeholder={'Enter Your Email Address'} />
      <Button
        label="Subscribe"
        iconPath="assets/icons/EnvelopeSimple.svg"
        className="w-full h-11"
      />
    </div>
  );
}
